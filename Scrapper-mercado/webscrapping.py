import json
import logging
import re
import time
from dataclasses import dataclass, asdict
from typing import Optional

import requests
from selenium import webdriver
from selenium.common.exceptions import NoSuchElementException, TimeoutException
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait

logger = logging.getLogger(__name__)

BASE_URL = "https://www.panamericana.com.co"
USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
)
DEFAULT_TIMEOUT = 15

# --- Selectores del LISTADO (página de búsqueda/categoría) ---
SEL_LINK_PRODUCTO = "a.vtex-product-summary-2-x-clearLink"

# --- Selectores de la FICHA DE PRODUCTO (PDP) ---
SEL_TITULO = "span.vtex-store-components-3-x-productBrand"
SEL_PRECIO = "span.vtex-product-price-1-x-sellingPrice"
SEL_IMAGEN = "img.vtex-store-components-3-x-productImageTag--main"
SEL_DESCRIPCION = "div.vtex-store-components-3-x-productDescriptionText"

# --- Ficha técnica (addons): cod., marca, autor, páginas, idioma, encuadernación, fecha ---
SEL_ADDONS_CONTENEDOR = "[class*='product-addons']"
SEL_ADDON_ITEM = "div.w-50.pa2"
SEL_ADDON_ETIQUETA = "span.fw9"
SEL_ADDON_VALOR = "span.db.f7:not(.fw9), a.db.f7"

# --- Disponibilidad / stock (AJUSTAR cuando tengamos el HTML real) ---
# Placeholder: el botón "Agregar" suele desactivarse o cambiar de texto cuando no hay stock.
SEL_BOTON_AGREGAR = "button:has(span.vtex-add-to-cart-button-0-x-buttonText)"


@dataclass
class Libro:
    """Representa un libro extraído de Panamericana."""

    nombre: Optional[str] = None
    precio: Optional[str] = None
    imagen_url: Optional[str] = None
    descripcion: Optional[str] = None
    url: Optional[str] = None

    # Ficha técnica
    codigo_interno: Optional[str] = None   # 'cod.' - probablemente NO es ISBN
    marca_editorial: Optional[str] = None  # 'marca' -> mapea a editorial, no siempre = autor_id
    autor: Optional[str] = None
    num_paginas: Optional[int] = None
    idioma: Optional[str] = None
    encuadernacion: Optional[str] = None
    anio_edicion: Optional[str] = None     # solo año, ej. "2026"

    # Sin confirmar todavía (pendiente HTML de disponibilidad)
    disponible: Optional[bool] = None


class PanamericanaScraper:
    """Encapsula un navegador Selenium para scrapear libros de panamericana.com.co."""

    def __init__(self, headless: bool = True, timeout: int = DEFAULT_TIMEOUT):
        self.timeout = timeout
        self.driver = self._crear_driver(headless)
        self.wait = WebDriverWait(self.driver, timeout)

    def _crear_driver(self, headless: bool) -> webdriver.Chrome:
        options = Options()
        if headless:
            options.add_argument("--headless=new")
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")
        options.add_argument("--disable-gpu")
        options.add_argument("--window-size=1920,1080")
        options.add_argument(f"--user-agent={USER_AGENT}")
        options.add_argument("--disable-blink-features=AutomationControlled")
        options.add_experimental_option("excludeSwitches", ["enable-automation"])
        options.add_experimental_option("useAutomationExtension", False)

        driver = webdriver.Chrome(options=options)
        driver.execute_cdp_cmd(
            "Page.addScriptToEvaluateOnNewDocument",
            {
                "source": (
                    "Object.defineProperty(navigator, 'webdriver', "
                    "{get: () => undefined})"
                )
            },
        )
        return driver

    def abrir(self, url: str) -> None:
        logger.info("Abriendo %s", url)
        self.driver.get(url)
        self.wait.until(EC.presence_of_element_located((By.TAG_NAME, "body")))

    def buscar_listado(self, url_listado: str) -> None:
        """Abre una URL de listado/categoría/búsqueda ya armada (como la que usaste)."""
        self.abrir(url_listado)
        try:
            self.wait.until(
                EC.presence_of_element_located((By.CSS_SELECTOR, SEL_LINK_PRODUCTO))
            )
        except TimeoutException:
            logger.warning("No aparecieron productos en el listado; revisa la URL o selectores")
        self._scroll_para_cargar()

    def _scroll_para_cargar(self, pasos: int = 4, pausa: float = 1.0) -> None:
        altura_previa = 0
        for _ in range(pasos):
            self.driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
            time.sleep(pausa)
            altura_actual = self.driver.execute_script("return document.body.scrollHeight")
            if altura_actual == altura_previa:
                break
            altura_previa = altura_actual

    def extraer_urls_productos(self) -> list[str]:
        """Recolecta las URLs (absolutas) de las fichas de producto desde el listado actual."""
        enlaces = self.driver.find_elements(By.CSS_SELECTOR, SEL_LINK_PRODUCTO)
        urls: list[str] = []
        for enlace in enlaces:
            href = enlace.get_attribute("href")  # Selenium ya devuelve la URL absoluta
            if href and href not in urls:
                urls.append(href)
        logger.info("Se encontraron %d URLs de producto", len(urls))
        return urls

    def visitar_fichas(self, urls: list[str], pausa: float = 1.5) -> list[Libro]:
        """Visita cada ficha de producto y extrae toda la información disponible."""
        libros: list[Libro] = []
        for i, url in enumerate(urls, 1):
            logger.info("Visitando ficha %d/%d: %s", i, len(urls), url)
            try:
                self.abrir(url)
            except TimeoutException:
                logger.warning("Timeout cargando %s, se omite", url)
                continue
            libro = self._extraer_detalle_ficha()
            libro.url = url
            libros.append(libro)
            time.sleep(pausa)  # pausa cortés entre requests
        return libros

    def _extraer_detalle_ficha(self) -> Libro:
        """Extrae todos los campos disponibles en la página de producto actual."""
        libro = Libro()

        libro.nombre = self._texto_opcional(self.driver, SEL_TITULO)
        libro.precio = self._parsear_precio(self._texto_opcional(self.driver, SEL_PRECIO))
        libro.imagen_url = self._atributo_opcional(self.driver, SEL_IMAGEN, "src")
        libro.descripcion = self._texto_opcional(self.driver, SEL_DESCRIPCION)

        addons = self._extraer_addons()
        libro.codigo_interno = addons.get("cod.")
        libro.marca_editorial = addons.get("marca")
        libro.autor = addons.get("autor")
        libro.idioma = addons.get("idioma")
        libro.encuadernacion = addons.get("encuadernación")
        libro.anio_edicion = addons.get("fecha de edición")

        paginas_texto = addons.get("n.° páginas")
        if paginas_texto:
            match = re.search(r"\d+", paginas_texto)
            libro.num_paginas = int(match.group()) if match else None

        return libro

    def _extraer_addons(self) -> dict[str, str]:
        """Extrae el bloque de ficha técnica (cod, marca, autor, páginas, idioma, etc.)."""
        datos: dict[str, str] = {}
        try:
            contenedor = self.driver.find_element(By.CSS_SELECTOR, SEL_ADDONS_CONTENEDOR)
        except NoSuchElementException:
            logger.warning("No se encontró el bloque de ficha técnica (addons)")
            return datos

        items = contenedor.find_elements(By.CSS_SELECTOR, SEL_ADDON_ITEM)
        for item in items:
            etiqueta = self._texto_opcional(item, SEL_ADDON_ETIQUETA)
            valor = self._texto_opcional(item, SEL_ADDON_VALOR)
            if etiqueta and valor:
                clave = etiqueta.rstrip(":").strip().lower()
                datos[clave] = valor
        return datos

    @staticmethod
    def _parsear_precio(texto: Optional[str]) -> Optional[str]:
        """De 'por: $ 139.000' devuelve '$139.000'"""
        if not texto:
            return None
        match = re.search(r"\$\s?[\d.,]+", texto)
        return match.group(0).replace(" ", "") if match else None

    @staticmethod
    def _texto_opcional(elemento, selector: str) -> Optional[str]:
        try:
            texto = elemento.find_element(By.CSS_SELECTOR, selector).text.strip()
            return texto or None
        except NoSuchElementException:
            return None

    @staticmethod
    def _atributo_opcional(elemento, selector: str, atributo: str) -> Optional[str]:
        try:
            valor = elemento.find_element(By.CSS_SELECTOR, selector).get_attribute(atributo)
            return valor.strip() if valor else None
        except NoSuchElementException:
            return None

    def cerrar(self) -> None:
        if self.driver:
            self.driver.quit()
            logger.info("Navegador cerrado")

    def __enter__(self) -> "PanamericanaScraper":
        return self

    def __exit__(self, exc_type, exc_val, exc_tb) -> None:
        self.cerrar()


# --- Configuración del envío a la API central ---
API_URL = "http://localhost:3000/api/items"
API_TIMEOUT = 10
API_REINTENTOS = 3
API_PAUSA_REINTENTO = 2.0


def empaquetar_resultados(libros: list[Libro], fuente: str = "panamericana") -> dict:
    """Empaqueta la lista de libros extraídos en la estructura JSON que se envía a la API."""
    return {
        "fuente": fuente,
        "cantidad": len(libros),
        "extraido_en": time.strftime("%Y-%m-%dT%H:%M:%S%z"),
        "libros": [asdict(libro) for libro in libros],
    }


def enviar_resultados_api(
    libros: list[Libro],
    api_url: str = API_URL,
    fuente: str = "panamericana",
) -> bool:
    """Empaqueta los resultados en JSON y los transmite por POST a la API central.

    Cumple el punto de integración: al finalizar el ciclo de extracción, se
    ejecuta automáticamente para enviar los datos. Reintenta ante fallos de
    red o respuestas 5xx, con backoff simple.
    """
    payload = empaquetar_resultados(libros, fuente=fuente)
    logger.info(
        "Enviando %d libros a %s (payload de %d bytes)",
        len(libros), api_url, len(json.dumps(payload)),
    )

    for intento in range(1, API_REINTENTOS + 1):
        try:
            respuesta = requests.post(
                api_url,
                json=payload,
                timeout=API_TIMEOUT,
                headers={"Content-Type": "application/json"},
            )
            respuesta.raise_for_status()
            logger.info(
                "Envío exitoso (intento %d/%d): status=%d",
                intento, API_REINTENTOS, respuesta.status_code,
            )
            return True
        except requests.exceptions.RequestException as error:
            logger.warning(
                "Falló el envío a la API (intento %d/%d): %s",
                intento, API_REINTENTOS, error,
            )
            if intento < API_REINTENTOS:
                time.sleep(API_PAUSA_REINTENTO * intento)  # backoff simple

    logger.error("No se pudo enviar el resultado a la API tras %d intentos", API_REINTENTOS)
    return False


def ejecutar_ciclo_scraping(url_listado: str, api_url: str = API_URL) -> list[Libro]:
    """Ciclo completo: scrapea el listado, visita las fichas y transmite el resultado a la API."""
    with PanamericanaScraper(headless=True) as scraper:
        scraper.buscar_listado(url_listado)
        urls = scraper.extraer_urls_productos()
        libros = scraper.visitar_fichas(urls)

    # Integración: al finalizar la extracción, se empaqueta y transmite automáticamente.
    enviar_resultados_api(libros, api_url=api_url)
    return libros


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")

    url_listado = (
        "https://www.panamericana.com.co/ciencia-ficcion/libro"
        "?_q=libro&fuzzy=0&initialMap=ft&initialQuery=libro"
        "&layout=list&map=category-3,ft"
    )

    libros = ejecutar_ciclo_scraping(url_listado)

    print(f"\n{len(libros)} libros extraídos:\n")
    for l in libros:
        print(
            f"- {l.nombre} | {l.autor} | {l.precio} | {l.anio_edicion} | "
            f"{l.num_paginas} pág | {l.idioma} | {l.encuadernacion}"
        )
        print(f"  cod: {l.codigo_interno} | editorial/marca: {l.marca_editorial}")
        print(f"  img: {l.imagen_url}")
        if l.descripcion:
            resumen = l.descripcion[:150] + ("..." if len(l.descripcion) > 150 else "")
            print(f"  descripcion: {resumen}")
        else:
            print("  descripcion: (no se encontró en la ficha)")
        print(f"  url: {l.url}\n")