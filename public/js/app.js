/*Facebook likes*/
(function(d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) return;
        js = d.createElement(s); js.id = id;
        js.src = "//connect.facebook.net/en_US/all.js#xfbml=1";
        fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'facebook-jssdk'));


var App = {};
App.enableScrollToTop = function() {
	if($('.navbar').length > 0) {

		$('body').append('<div id="scroll-to-top-div"><small><a class="btn btn-inverse btn-small" href="#"><i class="icon-arrow-up icon-white"></i>&nbsp;Top</a></small></div>');
      var scrollToTop = function() {
        $("#scroll-to-top-div").css("left",$("#navbar-position-marker").position().left + $("#navbar-position-marker div:first").width() - 50 + "px");
	    }
	    $(window).resize(function() {
	      scrollToTop();
	    });
	    scrollToTop();
	}
}

var FeedbackPage = {};
FeedbackPage.addComment = function() {
  $("#commentForm").click(function(e){
    $(this).children('input[type=submit]').attr("disabled", "disabled");

    var commentTextArea = $(this).children('textarea');
    var comment = commentTextArea.val();
    if(jQuery.type(comment) !== 'undefined' && comment.length >= 5) {
      console.log($(this).children('textarea').val())
      var data = {
        text: comment
      }
      $.ajax({
        type: "POST",
        dataType: 'json',
        url: "/feedback/add",
        data: data,
        success: function(result) {
          FeedbackPage.addCommentElement(result);
          commentTextArea.val("");
        }
      });
    }
    e.preventDefault();
    $(this).children('input[type=submit]').removeAttr("disabled");
  });
};

FeedbackPage.addCommentElement = function(result) {  
  var html = "<div class=\"well well-small\">"
  + "<span class=\"muted\">"
  + moment.utc(result.createdAt).fromNow()
  + "</span><br/>"
  + result.text
  + "</div>";
  $("#comments-div").prepend(html);
};


FeedbackPage.listComment = function() {
  $.ajax({
    type: "GET",
    dataType: 'json',
    url: "/feedback/list",
    success: function(results) {
      $.each(results, function(i, result){
        FeedbackPage.addCommentElement(result);
      });
    }
  });
};

FeedbackPage.enable = function() {
  FeedbackPage.addComment();
  FeedbackPage.listComment();
}


var IndexPage = {
	tagMasterArray: [],
	tagNotDisplayedArray: [],
	tagToDisplayArray: [],
  tagRecord: null,
	columnArray: [],
	noOfColumns: 0
};

IndexPage.calculateNoOfColumns = function() {
  var firstColumnPositionTop = $(".tag-details-columns :first").position().top;
  $(".tag-details-columns").each(function(e) {
    if(firstColumnPositionTop === $(this).position().top) {
      IndexPage.noOfColumns = IndexPage.noOfColumns + 1;
    } else {
      $(this).remove();
    }
  });
}   

IndexPage.init = function() {
  this.calculateNoOfColumns();
}


IndexPage.getTags = function() {
  var self = this;
  $.ajax({
    url: "/tag/get",
    success: function(data) {
      $.each(data, function(i, tag){
        self.tagMasterArray.push(tag.name)
        if(i < 30) {
          $("#tag-results-column"+(i%5)).append("<a href=\"/catalog/details?tag="+encodeURIComponent(tag.name)+"\">"
            + "<span class=\" \">"
            + "<small>"+tag.name+"&nbsp;</small>"
            +"</span>"
            +"</a><br/>");
        }
      });              
      self.tagNotDisplayedArray = self.tagMasterArray;
      self.populateResults();
    }
  });
};

IndexPage.toggleLoadingTagSpinner = function() {
  // if($("#loading-tag-spinner-div").length <= 0) {
  //   $("#tag-details-results-column1").append("<img src=\"/img/spinner.gif\" alt=\"Loading.....\" id=\"loading-tag-spinner-div\"/>");
  // } else {
  //   $("#loading-tag-spinner-div").remove();
  // }
  //$("#tag-loading-indicator-div").remove();
}


IndexPage.populateResults = function() {         
  var self = this;
  self.tagToDisplayArray = new Array();
  for(var i = 1; i <= (self.noOfColumns*2); i++) {
    self.tagToDisplayArray.push(self.tagNotDisplayedArray.shift());
  }

  $.each(self.tagToDisplayArray, function(i, tag){
    $.ajax({
      type: "POST",
      dataType: 'json',
      url: "/catalog/search?tag="+encodeURIComponent(tag),
      success: function(results) {       
        var html = "<table class=\"table table-condensed tag-table\" tag=\""+tag+"\">"
          + "<caption><h5 class=\"text-info\"><a href=\"/catalog/details?tag="+encodeURIComponent(tag)+"\" class=\"tag-link\">"
          + tag
          + "</a></h5></caption>";
        $.each(results, function(j, catalog) {
          var averageRating = catalog.averageRating;
          if(typeof catalog.averageRating === 'undefined') {
            averageRating = 'n/a';
          }

          html  = html + "<tr class=\"tag-details-record\" netflixId=\""+catalog.netflixId+"\" recordId=\""+catalog._id+"\">"
          + "<td>"
          +"<i class=\"icon-chevron-right\"></i>"
          + "</td>"
          + "<td>"
          + "<a href=\"#\" class=\"tag-details-record-link\">"
          +"<small><span class=\"tag-details-record-title\">" + catalog.title + "</span></small>"
          + "</a>"
          +"</td>"
          + "<td>"
          + "<a href=\"#\" class=\"tag-details-record-link\">"
          +"<small>" + catalog.releaseYear + "</small>"
          + "</a>"
          +"</td>"
          + "<td>"
          + "<a href=\"#\" class=\"tag-details-record-link\">"
          +"<small>" + averageRating + "</small>"
          + "</a>"
          +"</td>"

          + "</tr>";
        });
        html  = html + "</table>";

        if(self.columnArray.length === 0) {
          for(var i = 1; i <= self.noOfColumns; i++) {
              self.columnArray.push(i);
          }
        }
        $("#tag-details-hidden-column"+self.columnArray.shift()).append(html);
        self.tagToDisplayArray.shift();

        //Remove spinner when done
        if(self.tagNotDisplayedArray.length === 0){
          $("#tag-loading-indicator-div").remove();
        }

        
        if(self.tagToDisplayArray.length === 0){

          $(".tag-details-hidden").each(function(e) {

            var tagColumnHeightMap = {};
            var tagColumnHeights = new Array();
            for(var i = 1; i <= self.noOfColumns; i++) {
                tagColumnHeightMap[i] = $("#tag-details-results-column"+i).height();
                tagColumnHeights.push($("#tag-details-results-column"+i).height());             
            }

            for(var k in tagColumnHeightMap) {
              if(tagColumnHeightMap[k] === _.min(tagColumnHeights)) {
                $("#tag-details-results-column"+k).append($(this).html());
                $(this).html("");
                break;
              }
            }          
          });
        }
      }
    });
  });
};


IndexPage.throttledShowTagRecordDetails = function() {
  $(document).on({
    click: function(e) {
      var recordId = $(this).attr("recordId");
      var netflixId = $(this).attr("netflixId");
      var tag = $(this).parent().parent().attr("tag");

      var recordDetailsDivId="record-details-"+recordId;

      if(_.isUndefined(IndexPage.tagRecord) === false && _.isNull(IndexPage.tagRecord) === false && IndexPage.tagRecord.attr("recordId") != recordId) {
        IndexPage.tagRecord.popover('hide');
      }

      $.ajax({
        type: "GET",
        dataType: 'json',
        url: "/catalog/get?recordId="+recordId+"&tag="+encodeURIComponent(tag),
        success: function(results) {
          var cast = [];
          $.each(results.cast, function(k, person){
            if($.inArray(person.name, cast) === -1) cast.push(person.name);
          });

          var directors = [];
          $.each(results.directors, function(k, person){
            if($.inArray(person.name, directors) === -1) directors.push(person.name);
          });

          html = "<div class=\"tag-details-record-popover\"><small><a href=\"#\" class=\"pull-right tag-details-record-popover-close\"><i class=\"icon-remove\"></i></a>"
          + "<b>" + results.title + "</b>"
          + "<span class=\"text-info\">&nbsp;&nbsp;" + results.releaseYear
          + "</span>"
          + "<table>"
          + "<tr>"
          + "<td width=\"40%\" class=\"box-art\">"
          + "<img src=\"" +results.boxArt + "\"/><br/>" 
          + "<a href=\"#\" onclick=\"javascript:nflx.addToQueue('"+netflixId+"', null, null, 'qaptap7nutk88e7k7z8hh68f', 'instant', '"+recordDetailsDivId+"');\">"
          + "<span><strong>Add to Instant Queue</strong></span>"
          + "</a>"
          + "</td>"
          + "<td width=\"60%\">"
          + results.shortSynopsis
          + "</td>"
          + "</tr>"
          + "<td colspan=\"2\">"
          + "<b>Cast: </b>"
          + cast.join(", ")
          + "<br/>"
          + "<b>Directors: </b>"
          + directors.join(", ")
          + "<br/>"
          + "<a href=\"/catalog/details?tag="+encodeURIComponent(tag)+"&anchor=anchor-"+recordId+"\">More >></a>"
          + "</td>"
          + "<tr>"
          + "</tr>"
          + "</table>"
          + "</small>"
          + "</div>"

          $("#"+recordDetailsDivId).html(html);
        }
      });

      var options = {};
      options.html = true;
      options.trigger = 'focus';
      options.placement = 'top';
      options.content = "<div id=\""+recordDetailsDivId+"\">"
      +   $(this).parent()
      + "</div>";

      $(this).popover(options);
      $(this).popover('show');
      IndexPage.tagRecord = $(this);
    },
    mouseleave: function() {
    }
  }, ".tag-details-record");

  $(document).on('click', ".tag-details-record-popover-close", function(e){
    if(_.isUndefined(IndexPage.tagRecord) === false) {
      IndexPage.tagRecord.popover('hide');
    }
    e.preventDefault();
  })
  $(document).on('click', ".tag-details-record-link", function(e){
    e.preventDefault();
  })

};

IndexPage.throttledPopulateResults = _.throttle(function(){
    IndexPage.populateResults();
}, 2000);

IndexPage.configureScroll = function() {
  $(window).scroll(function(e){
    //console.log("scrollTop="+$(this).scrollTop() + " windowHeight="+$(window).height() + " lastTablePosition=" + ($(".tag-table :last").position().top + $(".tag-table :last").height()));
    var scrollTopAndWindowHeight = $(this).scrollTop() + $(window).height();
    var lastTagTableBottomPosition = $(".tag-table :last").position().top + $(".tag-table :last").height();
    if(scrollTopAndWindowHeight > lastTagTableBottomPosition*1.0) {
        IndexPage.throttledPopulateResults();
    }
  });
}

IndexPage.configureSearch = function() {
  var options = {};
  options.source = function(query, process) {

    var contains = function(str) {
      return (str.toLowerCase().indexOf(query.toLowerCase()) >= 0)
    }

    var searchParam = {};
    searchParam.keyWords = [query];
    $.ajax({
        type: "POST",
        dataType: 'json',
        data: searchParam,
        url: "/catalog/search",
        success: function(results) {
          var array = [];
          $.each(results, function(i, result){
              if(contains(result.title)) {
                if($.inArray(result.title, array) === -1) array.push(result.title);
              } 
              $.each(result.cast, function(i, person){
                if($.inArray(person.name, array) === -1) array.push(person.name); 
              });
              $.each(result.directors, function(i, person){
                if($.inArray(person.name, array) === -1) array.push(person.name);
              });
          });
          return process(array);
        }
    });
  }
  $('.typeahead').typeahead(options);
  
}

IndexPage.enable = function() {
  IndexPage.init();
  IndexPage.getTags();
  IndexPage.configureScroll();
  IndexPage.throttledShowTagRecordDetails();
  IndexPage.configureSearch();
  App.enableScrollToTop();
}


/**************************** Details Page ****************************/
var DetailsPage = {};

DetailsPage.initalize = function(tagName, inSearchParam) {
  this.tag = {
    name: tagName,
    searchParam: inSearchParam || {}
  };

  this.searchParam = {
    genres: inSearchParam.genres || [],
    releaseYears: inSearchParam.releaseYears || [],
    averageRatings: inSearchParam.averageRatings || [],
    keyWords: inSearchParam.keyWords || [],
    showExpiringSoon: inSearchParam.showExpiringSoon || false,
    pageNumber: inSearchParam.pageNumber || 1,
    pageSize: inSearchParam.pageSize || 25,
    orderBy: inSearchParam.orderBy || "averageRating",
    sort: inSearchParam.sort || "desc"              
  };

  this.noMoreResults = false;
}

DetailsPage.init = function(params) {
  var inputParams = params || {}; 
  this.searchParam.pageNumber = 1;
  this.noMoreResults = false;
  if(jQuery.type(inputParams.orderBy) !== "undefined") {
    if(inputParams.toggleSort === true) {
      if(this.searchParam.orderBy === inputParams.orderBy) {
        if(this.searchParam.sort === "asc") {
          this.searchParam.sort = "desc";
        } else {
          this.searchParam.sort = "asc";
        }
      }
    }
    this.searchParam.orderBy = inputParams.orderBy;
  }
};

DetailsPage.hasNoMoreResults = function() {
  return this.noMoreResults === true;
};

DetailsPage.updateSearchParam = function() {
  var searchParam = this.searchParam;
  searchParam.genres = [];
  searchParam.releaseYears = [];
  searchParam.averageRatings = [];
  searchParam.showExpiringSoon = false;
  $.each($(".side-bar-genres-checkbox"), function(i, genresCheckBox) {                            
    if(genresCheckBox.checked === true) {
      searchParam.genres.push(genresCheckBox.value);
    }
  });

  $.each($(".side-bar-releaseYears-checkbox"), function(i, releaseYearsCheckBox) {                            
    if(releaseYearsCheckBox.checked === true) {
      searchParam.releaseYears.push(releaseYearsCheckBox.value);
    }
  });

  $.each($(".side-bar-averageRatings-checkbox"), function(i, averageRatingsCheckBox) {                            
    if(averageRatingsCheckBox.checked === true) {
      searchParam.averageRatings.push(averageRatingsCheckBox.value);
    }
  });
  searchParam.showExpiringSoon = (DetailsPage.showExpiring() || false);
};

DetailsPage.getSearchParam = function() {
  return this.searchParam;
};

DetailsPage.getSearchParam = function() {
  return this.searchParam;
};

DetailsPage.fetchData = function(callback) {
  var searchParam = this.searchParam;
  $.ajax({
      type: "POST",
      dataType: 'json',
      data: searchParam,
      url: "/catalog/search",
      success: function(results) {
        callback(results);
      }
  });
};

DetailsPage.showExpiring = function(callback) {
  return $("#side-bar-expiring-soon")[0].checked;
}


DetailsPage.generateResultsRow = function(data, metadata) {
  var recordDetailsDivId = "detail-record-" + data.recordId;
  var record = "<tr id=\""+recordDetailsDivId+"\">"
  + "<td><small>" 
  + "<a id=\"anchor-"+data.recordId+"\">"
  + "<img src=\"" + data.boxArt + "\"/>"            
  + "</a>"
  + "<br/>"
  + "<b>" + data.title + "</b>"
  + "<br/>"      

  + "<a href=\"#\" class=\"\" onclick=\"javascript:nflx.addToQueue('"+data.netflixId+"', null, null, 'qaptap7nutk88e7k7z8hh68f', 'instant', '"+recordDetailsDivId+"');return false;\">"
  +"Add to Instant Queue"
  +"</a></small>"

  + "</small></td>"
  + "<td><small>" + data.releaseYear + "</small></td>"
  + "<td><small>" + (data.averageRating || "n/a") + "</small></td>"
  + "<td>"
    + "<div class=\"detailed-synopsis\">"
      + "<small>"
        +"<div>" + data.synopsis + "</div>";

  var highlightClass = ""
  if(metadata.showExpiringSoon === true) {
    highlightClass = "text-error";
  }
  record = record + "<div class=\""+highlightClass+"\">" + "<b>Expiring On: </b>&nbsp;" 
  + moment.utc(data.availableUntil).format("MM/DD/YYYY") + " (in " +  moment.utc(data.availableUntil).diff(moment(), 'days') + " days)</div>";

  record = record +
        "<div>" + "<b>Genres: </b>" + data.genres + "</div>"
        +"<div>" + "<b>Cast: </b>" + data.cast + "</div>"
        + "<b>Directors: </b>" + data.directors
      + "</small>"
    + "</div>"
  +"</td>"
  + "</tr>";
  return record;
};      

DetailsPage.performPreFetch = function() {
  if(this.searchParam.pageNumber === 1) {
    $("#results-table tbody").html("");
  }
};

DetailsPage.performPostFetch = function() {
  this.searchParam.pageNumber++;
};     

DetailsPage.parseData = function(results) {
  var html = "";
  if(results.length === 0) {
    DetailsPage.noMoreResults = true;
    html = "<span class=\"muted\"><small>No More Results</small></span>";
    $("#results-table-loading-indicator-div").remove();
  }

  var showExpiringSoon = DetailsPage.showExpiring();

  $.each(results, function(j, catalog) {
    var averageRating = catalog.averageRating;
    if(jQuery.type(catalog.averageRating) === 'undefined') {
      averageRating = 'n/a';
    }

    var genres = [];
    $.each(catalog.genres, function(k, genre){
      if($.inArray(genre.name, genres) === -1) genres.push(genre.name);
    });

    var cast = [];
    $.each(catalog.cast, function(k, person){
      if($.inArray(person.name, cast) === -1) cast.push(person.name);
    });

    var directors = [];
    $.each(catalog.directors, function(k, person){
      if($.inArray(person.name, directors) === -1) directors.push(person.name);
    });

    html = html + DetailsPage.generateResultsRow({title: catalog.title, 
        releaseYear: catalog.releaseYear, 
        averageRating:averageRating, synopsis:catalog.synopsis, 
        cast:cast.join(", "), 
        directors:directors.join(", "),
        genres:genres.join(", "),
        availableUntil: catalog.availableUntil,
        netflixId: catalog.netflixId,
        recordId: catalog._id,
        boxArt: catalog.boxArt
      }, 
      {showExpiringSoon: showExpiringSoon}
      );
  });
  $("#results-table tbody").append(html);
  DetailsPage.performPostFetch();
};

DetailsPage.populateResults = function() {
    if(this.hasNoMoreResults() === false) {
      this.updateSearchParam();
      this.performPreFetch();
      this.fetchData(this.parseData);
    } 
};

DetailsPage.throttledPopulateResults = _.throttle(function(){
  DetailsPage.populateResults();
}, 2000);

/*This function can be more modularized*/
DetailsPage.enable = function() {

  $(".side-bar-field").click(function(e){
    var self = $(this);
    var isActive = false;
    self.parent().children(".side-bar-div").toggle();
    if(self.parent().hasClass('active')){
      isActive = true;
    } else {
      isActive = false;              
    }

    $(".side-bar-field").parent().removeClass('active')
    if(isActive === true) {
      self.parent().removeClass('active');
    } else {
      self.parent().addClass('active');
    }
    e.preventDefault();
  });

  $.ajax({
      url: "/stat/get",
      success: function(data) {
        populateFilterCriteria(data);
        initializeSearchParam();
        DetailsPage.init();
        DetailsPage.populateResults();
      }
  });


  var populateFilterCriteria = function(data) {
      $("#genres-container").html("");

      var addCheckBoxRecord = function(records, recordName) {

        var row = "<div class=\"side-bar-sall-checkbox\" >"
        + "<label class=\"checkbox\"><small>Select/Clear All</small>"
        + "<input id=\"side-bar-"+recordName+"-sall-checkbox\" type=\"checkbox\">" 
        + "</label>"
        + "</div>";

        $("#side-bar-"+recordName).append(row);

        $.each(records, function(index, record){                  
          var row = "<div>"
          + "<label class=\"checkbox\"><small>" + record.name + "</small>"
          + "<input id=\""+recordName+"-checkbox-"+record.id+"\" class=\"side-bar-checkbox side-bar-"+recordName+"-checkbox\" type=\"checkbox\" value=\"" + record.id + "\">"
          + "&nbsp;<span class=\"text-info\"><small>("+record.count+")</span></b>"
          + "</label>"
          + "</div>";
          $("#side-bar-"+recordName).append(row);
        });
      };
      addCheckBoxRecord(data.genres, "genres");
      addCheckBoxRecord(data.releaseYears, "releaseYears");
      addCheckBoxRecord(data.averageRatings, "averageRatings");
  };

  var initializeSearchParam = function() {
    if(jQuery.type(DetailsPage.tag.searchParam.genres) !== "undefined") {
      $.each(DetailsPage.tag.searchParam.genres, function(i, genreId){
        $("#genres-checkbox-"+genreId).prop('checked', true);
      });
    }

    if(jQuery.type(DetailsPage.tag.searchParam.releaseYears) !== "undefined") {
      $.each(DetailsPage.tag.searchParam.releaseYears, function(i, releaseYear){
        $("#releaseYears-checkbox-"+releaseYear).prop('checked', true);
      });
    }

    if(jQuery.type(DetailsPage.tag.searchParam.showExpiringSoon) !== "undefined") {
      $("#side-bar-expiring-soon").prop('checked', true);
    }
  };

  $(".sortable").click(function(e){
    DetailsPage.init({orderBy: $(this).attr("value"), toggleSort:true});
    DetailsPage.populateResults();
    e.preventDefault();
  });
  
  $(document).on("click", ".side-bar-checkbox", function(e){
    DetailsPage.init();
    DetailsPage.populateResults();

    $.each(["genres", "averageRatings", "releaseYears"], function(i, group) {
      document.getElementById("side-bar-"+group+"-sall-checkbox").checked = true;
      $.each($(".side-bar-"+group+"-checkbox"), function(i, e){
        if(e.checked === false) {
          $("#side-bar-"+group+"-sall-checkbox").removeAttr('checked');
        }
      });
    });
  });

  $.each(["genres", "averageRatings", "releaseYears"], function(i, group) {
    $(document).on("click", "#side-bar-"+group+"-sall-checkbox", function(e){
      var self = $(this)[0];
      $.each($(".side-bar-"+group+"-checkbox"), function(i, e){
        e.checked = self.checked;
      });

      DetailsPage.init();
      DetailsPage.populateResults();
    });
  });

  $("#side-bar-expiring-soon").parent().tooltip();
  $("#side-bar-expiring-soon").parent().click(function(e){
    $("#side-bar-expiring-soon")[0].checked = !$("#side-bar-expiring-soon")[0].checked;
    $("#side-bar-expiring-soon").trigger('click');
    e.preventDefault();
  });
  
  $(window).scroll(function(e){
    var scrollTopAndWindowHeight = $(this).scrollTop() + $(window).height();
    var resultsTableBottomPosition = $("#results-table").position().top + $("#results-table").height();
    if(scrollTopAndWindowHeight > resultsTableBottomPosition*1.0) { 
        DetailsPage.throttledPopulateResults();
    }
  });

  App.enableScrollToTop();
}