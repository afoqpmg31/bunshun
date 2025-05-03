// Lazy Load
//全ページloading=lazy変更後ファイルごと削除
const observer = lozad('.lozad', {
  rootMargin: '100px 0px'
});
observer.observe();