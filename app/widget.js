function bookimedWidget(obj) {
    var _this = this;
    
    if (obj.id) {
        this.id = obj.id;
        this.blockId = obj.blockId || '.js-bookimed-widget';
        this.maxPage = obj.maxPage || 13;
        this.mediaPoint = obj.mediaPoint || 520;
        this.maxWidth= obj.maxWidth ? obj.maxWidth + 'px' : 'none';
        this.maxHeight= obj.maxHeight ? obj.maxHeight + 'px' : 'none';
        this.maxTextHeight= parseInt(this.maxWidth) < this.mediaPoint ? 60 : 40;
        this.host = obj.host || 'https://bookimed.com/';
        this.lazyLoadOffset = obj.lazyLoadOffset && obj.lazyLoadOffset < 500 ?obj.lazyLoadOffset : 100;
        this.paddingConst = obj.paddingConst || 60;
        this.widget = document.querySelector(this.blockId);
        this.headerWidget = this.widget.querySelector('.b-w-header');
        this.headerTopWidget = this.headerWidget.querySelector('.b-w-top');
        this.headerDownWidget = this.headerWidget.querySelector('.b-w-down');
        this.contentWidget = this.widget.querySelector('.b-w-content');
        this.reviews = this.widget.querySelectorAll('.b-w-review');
        this.btnMore = this.widget.querySelectorAll('div.b-w-more');
        this.preloader = this.widget.querySelector('.b-w-preloader');
        this.lastReview = this.reviews[this.reviews.length - 1];
        this.loadPage = 1;
        this.isLoaded = true;

        this.getReviews = function() {
            if (this.maxPage != this.loadPage && this.isLoaded) {
                this.showPreloader();

                var request = new XMLHttpRequest();

                request.open('GET', this.host + '/widget/' + this.id + '/?page=' + this.loadPage, false);

                request.onload = function() {
                    if (request.status >= 200 && request.status < 400) {
                        var response = JSON.parse(request.responseText);
    
                        if (response.header) {
                            _this.headerTopWidget.innerHTML = response.header;
                            _this.headerTopWidget.insertAdjacentHTML('afterend', response.header);
                            _this.headerTopWidget.parentNode.removeChild(_this.headerTopWidget);
                            _this.headerDownWidget.parentNode.removeChild(_this.headerDownWidget);
                        }

                        if (response.reviews) {
                            _this.contentWidget.innerHTML += response.reviews;
                            _this.loadPage++;
                            _this.reloadReviews();
                            _this.hideDisableMoreBtn();
                        } else {
                            _this.maxPage = _this.loadPage;
                        }

                        _this.hidePreloader();
                        
                    } else {
                        console.error('Request is bad. ' + request.status + ': ' + request.statusText);
                        _this.hidePreloader();
                    }
                };

                request.send();
            }
        };

        this.setSize = function() {
            this.widget.setAttribute("style", "max-width:" + this.maxWidth + ";max-height:" + this.maxHeight);

            if (parseInt(this.maxWidth) < this.mediaPoint) {
                this.widget.classList.add('small');
            }
        }

        this.addContentMaxHeight = function() {
            var maxHeight = this.widget.getBoundingClientRect().height - this.paddingConst - this.headerWidget.getBoundingClientRect().height;

            this.contentWidget.setAttribute("style","height:" + maxHeight + "px");
        }

        this.reloadReviews = function() {
            this.reviews = this.widget.querySelectorAll('.b-w-review');
            this.lastReview = this.reviews[this.reviews.length - 1];
            this.initShowHideBtn();
        }

        this.hideDisableMoreBtn = function() {
            var _this = this;

            this.reviews.forEach(function(review) {
                var reviewHeight = review.querySelector('.b-w-text').getBoundingClientRect().height;

                if (reviewHeight < _this.maxTextHeight) {
                    var btnReview = review.querySelector('.b-w-more');

                    if (btnReview) btnReview.remove();
                }
            });
        }

        this.debounce = function debounce(a,b,c){var d;return function(){var e=this,f=arguments;clearTimeout(d),d=setTimeout(function(){d=null,c||a.apply(e,f)},b),c&&!d&&a.apply(e,f)}};

        this.initLazyLoad = function() {
            _this.contentWidget.onscroll = this.debounce(function() {
                var contentCoordinate = _this.contentWidget.getBoundingClientRect(),
                    lastReviewCoordinate = (_this.lastReview ? _this.lastReview.getBoundingClientRect() : contentCoordinate),
                    offset = lastReviewCoordinate.y + lastReviewCoordinate.height - contentCoordinate.y - contentCoordinate.height;

                if (offset < _this.lazyLoadOffset) {
                    _this.getReviews();
                }
            }, 100);
        }

        this.showPreloader = function() {
            _this.isLoaded = false;
            _this.preloader.classList.add('active');
        }

        this.hidePreloader = function() {
            _this.isLoaded = true;
            _this.preloader.classList.remove('active');
        }

        this.initShowHideBtn = function() {
            this.btnMore = this.widget.querySelectorAll('div.b-w-more');

            _this.btnMore.forEach(function(elem) {
                elem.addEventListener('click', function() {
                    var classList = this.classList;
    
                    if (~classList.value.indexOf('active')) {
                        classList.remove('active');
                        this.closest('.b-w-review').classList.remove('full');
                    } else {
                        classList.add('active');
                        this.closest('.b-w-review').classList.add('full');
                    }
                });
            });
        }

        this.setSize();
        this.initShowHideBtn();
        this.initLazyLoad();
        this.addContentMaxHeight();
        this.getReviews();
    } else {
        console.error("Id is required parametr. If you have any problems, contact Bookimed.")
    }
}