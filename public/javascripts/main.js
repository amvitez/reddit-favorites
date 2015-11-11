//document loaded
function setActiveTab(index){
	$('.nav-container ul li').removeClass("active");
	$('.nav-container ul li:nth-child('+index+')').addClass("active");
}

if(!$('body').hasClass("login-body")){
	if($('body').hasClass("hot-body")){
		setActiveTab(1);
	}
	else if($('body').hasClass("top-body")){
		setActiveTab(2);
	}
	else{
		setActiveTab(3);
	}
}

$('form button').click(function(){
	$(this).hide();
	$('~ div', this).addClass("throbber-loader");
});

$('.toggle-favorite').click(function(){
	var that = this;

	if($(that).hasClass("processing")) return;

	$(that).addClass("processing");
	$('span', that).hide();
	$(that).append("<div class='spinner-loader'>Loading...</div>");

	if($(that).hasClass("toggle-false")){
		$.post('/addFavorite', 
		{ 
			redditID: $(this).data("id"),
			title: $(this).data("title"),
			url: $(this).data("url"),
			thumbnail: $(this).data("thumbnail")  
		}, 
		function(){
			$(that).removeClass('toggle-false').addClass('toggle-true');
			$('span', that).removeClass('glyphicon-star-empty').addClass('glyphicon-star');
			$('div.spinner-loader', that).remove();
			$('span', that).show();
			$(that).removeClass("processing");
		});
	}else{
		$.post('/deleteFavorite',
		{
			redditID: $(that).data("id")
		},
		function(){
			$(that).removeClass('toggle-true').addClass('toggle-false');
			$('span', that).removeClass('glyphicon-star').addClass('glyphicon-star-empty');
			$('div.spinner-loader', that).remove();
			$('span', that).show();
			$(that).removeClass("processing");
		});
	}
});

$('.favorite-post button').click(function(){
	var that = this;

	$.confirm({
	    text: "Are you sure you want to delete this favorite?",
	    confirm: function() {
	        $(that).hide();

			$.post('/deleteFavorite',
			{
				redditID: $(that).data("id")
			},
			function(){
				$(that).parent().remove();
			});
	    },
	    cancel: function() {
	        // do nothing
	    }
	});
});

var hideError = function(){
	if($('.error-message').text().length > 0)
		$('.error-message').hide(500);
}

$('.login-body input').focus(hideError);

$('.login-body .nav-pills li').click(hideError);