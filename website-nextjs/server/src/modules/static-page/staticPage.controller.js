// staticPage.controller.js
import staticPageService from './staticPage.service.js';

function formatHtmlForMobile(html, title) {
  if (!html) return '';
  let cleanHtml = html.trim();
  cleanHtml = cleanHtml.replace(/^<h2[^>]*>.*?<\/h2>/i, '');
  cleanHtml = cleanHtml.replace(/<h2([^>]*)>/gi, '<h3$1>');
  cleanHtml = cleanHtml.replace(/<\/h2>/gi, '</h3>');
  cleanHtml = cleanHtml.replace(/<h[4-6][^>]*>([\s\S]*?)<\/h[4-6]>/gi, '<p><strong>$1</strong></p>');
  cleanHtml = cleanHtml.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (match, content) => {
    const trimmed = content.trim();
    if (/^[•\-\d*]/i.test(trimmed)) {
      return `<p>${content}</p>`;
    }
    return `<p>• ${content}</p>`;
  });
  cleanHtml = cleanHtml.replace(/<\/?(ul|ol)[^>]*>/gi, '');
  return `<h2>${title}</h2>\n${cleanHtml}`;
}

const staticPageController = {
  getPage: async (req, res) => {
    try {
      const page = await staticPageService.getPage(req.params.slug);
      
      if (page && (page.slug === 'privacy-policy' || page.slug === 'terms-and-conditions')) {
        page.content = formatHtmlForMobile(page.content, page.title);
      }
      
      res.status(200).json({ success: true, data: page });
    } catch (err) {
      res.status(err.status || 500).json({ success: false, message: err.message });
    }
  },
};

export default staticPageController;