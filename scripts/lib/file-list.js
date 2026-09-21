// 注: /projects/<slug>/ (Project Detail)は scripts/generate-project-pages.js で
// partials/header.html・footer.html を直接読み込んで都度生成しているため、
// このリストに含める必要はない。header/footerを編集したら generate-project-pages.js も再実行すること。
module.exports = [
  "index.html",
  "about.html",
  "contact.html",
  "contact-success.html",
  "privacy.html",
  "404.html",
  "astronomy/index.html",
  "blog/index.html",
  "lab/index.html",
  "projects/index.html",
  "research-log/index.html",
  "study/index.html"
];
