$(function(){
  /* ヘッダ横スクロール
  ---------------------------------------------------------------------*/
  let header = document.querySelector("header");
  let search = document.getElementById("group-search");

  window.addEventListener('scroll', function(){
    if(header) header.style.left = -window.scrollX + "px";
    if(search) search.style.left = -window.scrollX + "px";
  }, false);

  /* ナビゲーション
  ---------------------------------------------------------------------*/

  // カテゴリーのイニシャライズとしてcurrentが付与されているパネルの内容を入れ込む
  var $category_group = $("#group-category.header-panel-list");
  var category_current_panel_name = $category_group.find(".menu-list li a.current").data("category");
  var category_more_url = $category_group.find(".menu-list li a.current").attr("href");

  ajaxPanelList($category_group, category_current_panel_name, category_more_url);

  // 特集のイニシャライズとしてグループの内容を入れ込む
  var $feature_group = $("#group-feature.header-panel-list");
  var feature_name = $("header nav ul.header-nav").find("[data-code='feature']").find("a").data("category");
  var feature_more_url = $("header nav ul.header-nav").find("[data-code='feature']").find("a").attr("href");

  ajaxPanelList($feature_group, feature_name, feature_more_url);

  // ナビゲーション 検索タブ 20210909追加
  $('.header-search').click(function() {
    $('#group-search').slideToggle(300);
    $('#search_link').toggleClass('active');

    return false;
  });

  // ナビゲーション　ホバー開閉タブ　20210909追加
  var parent = document.querySelectorAll(".has-sub-panel");
  var node = Array.prototype.slice.call(parent, 0);
  node.forEach(function(element) {
    element.addEventListener("mouseover", function() {
      element.querySelector(".sub-panel").classList.add("active");
      element.classList.add("active");
    }, false);
    element.addEventListener("mouseout", function() {
      element.querySelector(".sub-panel").classList.remove("active");
      element.classList.remove("active");
    }, false);
  });

  // サブメニューをクリックした際の処理
  var panel_progress = false;

  $("#group-category .menu-list li a").on("click",function(){
    if(!panel_progress){
      panel_progress = true;

      var $parents_group = $(this).parents(".header-panel-list");
      var panel_name = $(this).data("category");
      var more_url = $(this).attr("href");

      $("#group-category .menu-list li a").removeClass("current");
      $(this).addClass("current");

      ajaxPanelList($parents_group, panel_name, more_url);
    }

    return false;
  });

  // 非同期でパネルの内容を取得して構築する関数
  function ajaxPanelList($group, panel_name, more_url){
    var $panel_list = $group.find('.panel-list');
    var $more_link = $group.find('.more-link');
    var request_url = '/list/header/panel.json?panel_name=' + panel_name;

    $.ajax({
      url: request_url,
      type: 'GET',
      dataType: 'json'
    }).done(function(res){
      var ga_track_cat = (panel_name == '特集') ? 'features' : 'category';
      var ga_track_code = 'data-track-category="PC Header '+ ga_track_cat +' article" data-track-action="click"';

      var panel_tag = '';
      panel_tag += '<ul class="panel-list none">';
      for(var i=0; i < res.length; i++){
        panel_tag += '<li>';
        panel_tag += '<div class="panel-img '+ panel_name +'"><a class="ga_tracking" href="'+ res[i]['url'] +'" '+ ga_track_code +'>';
        panel_tag += '<img src="'+ res[i]['img'] +'" alt="'+ res[i]['title'] +'">';
        panel_tag += '</a></div>';
        panel_tag += '<p class="panel-title"><a class="ga_tracking" href="'+ res[i]['url'] +'" '+ ga_track_code +'>'+ res[i]['title'] +'</a></p>';
        panel_tag += '</li>';
      }
      panel_tag += '</ul>';

      $more_link.attr('href', more_url);
      $more_link.before(panel_tag);

      if($panel_list.length) $panel_list.remove();
      $group.find('.panel-list').removeClass('none');

      panel_progress = false;

      // エラー文言があれば消しておく
      if($group.find('p.error').length) $group.find('p.error').remove();
    }).fail(function(err){
      $panel_list.remove();
      $group.find('p.error').remove();
      $more_link.attr('href', more_url);
      $more_link.before('<p class="error">新着記事を取得できませんでした。</p>');

      panel_progress = false;
    });
  }

});
