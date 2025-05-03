const vm = new Vue({
  el: '.sub-ranking',
  data: {
    loading: false,
    judgeAll: false,
    dataGenre: document.getElementsByClassName("sub-ranking")[0].dataset.genre,
    currentGenre: '',
    currentCat: 'realtime',
    categorizes: [{
      'realtime': { publishs: [] }
    },{
      '24hours': { publishs: [] }
    },{
      'weekly': { publishs: [] }
    },{
      'monthly': { publishs: [] }
    },{
      'photo': { publishs: [] }
    },{
      'fbtwshare': { publishs: [] }
    },{
      'comment': { publishs: [] }
    }],
    error: null,
    path: '/list/api/ranking',
    param_genre: 'genre=',
    param_cat: 'categorize=',
  },
  methods: {
    isAll: function(){
      this.judgeAll = true;
    },
    isNotAll: function(){
      this.judgeAll = false;
    },
    isGenre: function (genre) {
      this.loading = true;
      this.currentGenre = genre;
      this.dataGenre = this.currentGenre;
      const _this = this;
      const target_cat = 'realtime';
      const request_link = this.path + "?" + this.param_cat + target_cat + "&" + this.param_genre + this.currentGenre;
      axios.get(request_link)
        .then(function(response){
          _this.categorizes[0][target_cat].publishs = response.data;
          _this.loading = false;
        })
        .catch(function(error){
          _this.error = 'ランキングデータが取得できませんでした。';
          _this.loading = false;
        })
    },
    isCat: function (cat) {
      this.currentCat = cat;
      this.loading = true;
      createDom(cat);
    },
    request: function(categorize, index){
      const _this = this;
      this.currentGenre = this.dataGenre;
      const request_link = this.path + "?" + this.param_cat + categorize + "&" + this.param_genre + this.currentGenre;
      axios.get(request_link)
        .then(function(response){
          _this.categorizes[index][categorize].publishs = response.data;
          _this.loading = false;
          _this.$nextTick(function(){
            hiddenMoreBtn(this.currentGenre,categorize);
            displayCommentTab(categorize,this.currentGenre);
          })
        })
        .catch(function(error){
          _this.error = 'ランキングデータが取得できませんでした。';
          _this.loading = false;
        })
    },
    getCategorizes: function(){
      const cat_arr = [];
      for(let i=0; i < this.categorizes.length; i++){
        cat_arr.push(Object.keys(this.categorizes[i])[0]);
      }
      return cat_arr;
    }
  }
})

const categorizes = vm.getCategorizes();
const target = vm.currentCat;
const target_num = categorizes.indexOf(target);
const tab_all = document.querySelectorAll('.ranking-page-tab ul li');
if(target_num == 0) createDom('realtime');

function createDom(target){
  const num = categorizes.indexOf(target);
  vm.request(target, num);
}

function hiddenMoreBtn(genre,categorize){
  const moreBtn = document.getElementById('more-btn');
  if (!moreBtn) return;
  if(genre == '' && categorize == "comment"){
    //コメントランキングの場合、11位から20位を見るボタンを非表示に
    moreBtn.style.display = 'none';
  }else{
    moreBtn.style.display = 'block';
  }
}

function displayCommentTab(categorize,genre){
  // ジャンルが設定されていない記事の場合
  if(categorize == "realtime" & genre == ""){
    // コメントタブを表示
    $('.ranking-page-tab li:nth-child(7)').css('display','block');
  }
}

$(function(){
  function carousel(){
    if ($('.sub-ranking .list-carousel .swiper-wrapper').length === 0) return;

    const $carousel = new Swiper('.sub-ranking .list-carousel', {
      loop: true,
      loopPreventsSliding: false,
      longSwipesRatio: 0.1,
      autoHeight: true,
      speed: 700,
      on: {
        slideNextTransitionStart: function(){
          skipComment(this,0,vm.currentGenre);
        },
        slidePrevTransitionStart: function(){
          skipComment(this,5,vm.currentGenre);
        },
        transitionStart: function(index){
        //スライド変更開始時
          document.querySelector('.ranking-page-tab ul li.is-selected').classList.remove('is-selected');
          tab_all[index.realIndex].classList.add('is-selected');
          createDom(categorizes[index.realIndex]);
        },
        transitionEnd: function(){
        //スライド変更完了後
          closeMoreList();
        }
      }
    });

    tabBtn($carousel);
    openMoreList();
  }
  carousel();

  function tabBtn(swiper){
    $('.ranking-genre-tab li.tab').on('click', function () {
      $(".ranking-genre-tab li.tab.is-selected").removeClass('is-selected');
      $(this).addClass('is-selected');
      $(".ranking-page-tab li.tab.is-selected").removeClass('is-selected');
      $(".ranking-page-tab li.tab").eq(0).addClass('is-selected');
      swiper.slideToLoop(0);
      closeMoreList();
    });

    $('.ranking-page-tab li.tab').on('click', function () {
      const index = $(this).index();
      swiper.slideToLoop(index);
    });

    $('.ranking-genre-tab li.tab.genre').on('click', function () {
      $('.ranking-page-tab li:nth-child(7)').css('display','none');
    });
    $('.ranking-genre-tab li.tab.all').on('click', function () {
      $('.ranking-page-tab li:nth-child(7)').css('display','block');
    });
  }

  //「11位から20位を見る」ボタン押下時
  function openMoreList(){
    $('.sub-ranking').on('click', '.more-btn', function () {
      const $currentList = $('.carousel-cell.swiper-slide-active ul');
      $('.sub-ranking').addClass('more');
      $('.sub-ranking .list-carousel').css('height',$currentList.height() + 'px');
    });
  }

  //スライド変更時高さ戻して11位以降非表示
  function closeMoreList(){
    $('.sub-ranking .list-carousel').css('height','auto');
    $('.sub-ranking.more').removeClass('more');
  }

  //ジャンルが総合以外の場合スワイプでのスライド変更でコメントカテゴリに移動させない
  function skipComment(swiper,toNum,genre){
    const $slideComment = $('.list-carousel div[aria-label="7 / 7"]');
    if(genre == ""){
      $slideComment.css('opacity','1');
    }else{
      $slideComment.css('opacity','0');
      if($slideComment.hasClass('swiper-slide-active')){
        swiper.slideToLoop(toNum);
      }
    }
  }
});