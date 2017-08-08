// ==UserScript==
// @name        IDJumper for 4chan
// @namespace   IDJumper.4chan
// @description Add button to jump to next post by same ID
// @author      ebinBuddha
// @include     http*://boards.4chan.org/pol/*
// @include     http*://boards.4chan.org/bant/*
// @exclude     http*://boards.4chan.org/pol/catalog
// @exclude     http*://boards.4chan.org/bant/catalog
// @version     0.1.0
// @grant       none
// @run-at      document-end
// @updateURL   https://github.com/ebinBuddha/ID-Jumper-for-4chan/raw/master/ID-Jumper-for-4chan.meta.js
// @downloadURL https://github.com/ebinBuddha/ID-Jumper-for-4chan/raw/master/ID-Jumper-for-4chan.user.js
// ==/UserScript==

var classes = [];
var ids     = [];

/** parse the posts already on the page before thread updater kicks in */
function parseOriginalPosts() {
    var tempAllPostsOnPage = document.getElementsByClassName('postContainer');
    allPostsOnPage = Array.prototype.slice.call(tempAllPostsOnPage); //convert from element list to javascript array
    postNrs = allPostsOnPage.map(function (p) {
        return p.id.replace("pc", "");
    });
}


function gotoNext(className,post) {
    var index = classes.indexOf(className);
    if (index >- 1) {
        var index2 = ids[index].indexOf("pc" + post);
        if (index2 >- 1 ) { // which should be ffs
            var len = ids[index].length;
            
            var dest = ids[index][(index2+1) % len]; // get next post by same id, goes back from the first if last is clicked
            document.getElementById(dest).scrollIntoView();
        }
    }
}


//⏩
function setup() {
    console.log("setup");
    var boardID = window.location.pathname.split('/')[1];
    
    postNrs.forEach(function (post) {
        var postToAddArrowTo = document.getElementById("pc" + post),
        postInfo = postToAddArrowTo.getElementsByClassName('postInfo')[0],
        nameBlock = postInfo.getElementsByClassName('nameBlock')[0],
        currentID = nameBlock.getElementsByClassName('posteruid')[0];
        
        if (!currentID) return;
        
        var className = currentID.className;
        
        if (classes.indexOf(className)==-1) {
           classes.push(className);
           var tempindex = classes.indexOf(className);
           ids[tempindex]= new Array ( );  // initialize as array
        }
        //console.log(ids);
        // add reference to the enumerating array
        var index = classes.indexOf(className);
        ids[index].push("pc" + post);
        // add the button
        var fwdButton = document.createElement('a');

        currentID.appendChild(fwdButton);   
        fwdButton.class = "fwdButton";
        fwdButton.innerHTML = "⏩";
        fwdButton.onclick = function(){gotoNext(className,post);}
        fwdButton.href = "javascript:void(0)";
        
        //postNrs are resolved and should be removed from this variable
        var index = postNrs.indexOf(post.post_nr);
        if (index > -1) {
            postNrs.splice(index, 1);
        }        
        
    });
    
    postNrs = [];
    

}

function resolvePosts() {
    console.log("parse");
    var boardID = window.location.pathname.split('/')[1];
    if (boardID === "pol" || boardID === "bant") {
       setup();
    }
}

/** Listen to post updates from the thread updater for 4chan x v2 (loadletter) and v3 (ccd0 + ?) */
document.addEventListener('ThreadUpdate', function (e) {
    console.log('threadupdate');
    var evDetail = e.detail || e.wrappedJSObject.detail;
    var evDetailClone = typeof cloneInto === 'function' ? cloneInto(evDetail, unsafeWindow) : evDetail;

    //ignore if 404 event
    if (evDetail[404] === true) {
      return;
    }

    setTimeout(function () {
        //add to temp posts and the DOM element to allPostsOnPage
        evDetailClone.newPosts.forEach(function (post_board_nr) {
            var post_nr = post_board_nr.split('.')[1];
            postNrs.push(post_nr);
            var newPostDomElement = document.getElementById("pc" + post_nr);
            //allPostsOnPage.push(newPostDomElement);
        });
    }, 0);

    //setTimeout to support greasemonkey 1.x
    setTimeout(resolvePosts, 0);
}, false);

/** Listen to post updates from the thread updater for inline extension */
document.addEventListener('4chanThreadUpdated', function (e) {
    console.log('4chanthreadupdated');
    var evDetail = e.detail || e.wrappedJSObject.detail;

    var threadID = window.location.pathname.split('/')[3];
    var postsContainer = Array.prototype.slice.call(document.getElementById('t' + threadID).childNodes);
    var lastPosts = postsContainer.slice(Math.max(postsContainer.length - evDetail.count, 1)); //get the last n elements (where n is evDetail.count)

    //add to temp posts and the DOM element to allPostsOnPage
    lastPosts.forEach(function (post_container) {
      var post_nr = post_container.id.replace("pc", "");
      postNrs.push(post_nr);
      //allPostsOnPage.push(post_container);
    });

    //setTimeout to support greasemonkey 1.x
    setTimeout(resolvePosts, 0);
}, false);

parseOriginalPosts();
setup();