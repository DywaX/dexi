/**
 * Dexi Room — canli site ayarlari (kopyala/yapistir dostu)
 * ---------------------------------------------------------
 * Domain ve Gmail buraya. Tirnak icini degistir, kaydetmeyi unutmayin.
 *
 * publicBaseUrl : Kalici adres — sonda slash OLMAMALI.
 *   Ornekler:
 *     https://www.senin-markan.com
 *     https://kullaniciadi.github.io/repo-adi        (GitHub Pages)
 *
 * contactEmail : Görünür iletisim (Gmail veya kurumsal @domain).
 *
 * Bunlar güvenlik sirri degildir (anon anahtar gibi degil); sadece sitede
 * kullanilirlar. Yayina alinca bu dosya da sunucuya yüklenmis olur.
 */
window.DexiSiteConfig = {
  publicBaseUrl: "",
  contactEmail: "",
};

(function () {
  function trimTrailingSlash(value) {
    return String(value).replace(/\/+$/, "");
  }

  window.getDexiPublicSiteBase = function getDexiPublicSiteBase() {
    const raw = window.DexiSiteConfig && window.DexiSiteConfig.publicBaseUrl;
    if (raw != null && String(raw).trim()) {
      return trimTrailingSlash(String(raw).trim());
    }
    return trimTrailingSlash(new URL(".", window.location.href).href);
  };

  function applyDexiSiteBranding() {
    const cfg = window.DexiSiteConfig || {};
    const email = (cfg.contactEmail || "").trim();

    document.querySelectorAll("[data-site-contact-email]").forEach((node) => {
      const anchor = node;
      const row = anchor.closest("[data-site-contact-row]");
      if (email) {
        anchor.href = `mailto:${email}`;
        anchor.textContent = email;
        if (row) row.hidden = false;
      } else if (row) {
        row.hidden = true;
      }
    });

    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      let href;
      if (cfg.publicBaseUrl && String(cfg.publicBaseUrl).trim()) {
        const base = window.getDexiPublicSiteBase();
        href = `${base}${window.location.pathname}${window.location.search}`;
      } else {
        href = window.location.href.split("#")[0];
      }
      canonical.setAttribute("href", href);
    }

    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) {
      ogUrl.setAttribute("content", window.location.href.split("#")[0]);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", applyDexiSiteBranding);
  } else {
    applyDexiSiteBranding();
  }
})();
