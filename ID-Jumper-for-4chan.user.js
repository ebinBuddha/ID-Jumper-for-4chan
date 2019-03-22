// ==UserScript==
// @name        IDJumper for 4chan
// @namespace   IDJumper.4chan
// @description Add button to jump to next post by same ID
// @author      ebinBuddha
// @include     http*://boards.4chan.org/pol/*
// @include     http*://boards.4chan.org/bant/*
// @exclude     http*://boards.4chan.org/pol/catalog
// @exclude     http*://boards.4chan.org/bant/catalog
// @version     0.1.1
// @grant       none
// @run-at      document-end
// @updateURL   https://github.com/ebinBuddha/ID-Jumper-for-4chan/raw/master/ID-Jumper-for-4chan.meta.js
// @downloadURL https://github.com/ebinBuddha/ID-Jumper-for-4chan/raw/master/ID-Jumper-for-4chan.user.js
// ==/UserScript==

var classes = [];
var ids     = [];

// retarded javascript is retarded
function mod(n, m) {
    return ((n % m) + m) % m;
}

/** parse the posts already on the page before thread updater kicks in */
function parseOriginalPosts() {
    var tempAllPostsOnPage = document.getElementsByClassName('postContainer');
    allPostsOnPage = Array.prototype.slice.call(tempAllPostsOnPage); //convert from element list to javascript array
    postNrs = allPostsOnPage.map(function (p) {
        return p.id.replace("pc", "");
    });
}


function Jump(className,post,dir) {
    var index = classes.indexOf(className);
    if (index >- 1) {
        var index2 = ids[index].indexOf("pc" + post);
        if (index2 >- 1 ) { // which should be ffs
            var len = ids[index].length;

            var prev = ids[index][mod(index2,len)];
            var prevPos = document.getElementById(prev).getBoundingClientRect();
            // console.log(prevPos.top, prevPos.right, prevPos.bottom, prevPos.left);

            var dest = ids[index][mod(index2+dir,len)]; // get next post by same id, goes back from the first if last is clicked
            var destPos = document.getElementById(dest).getBoundingClientRect();

            var base = document.documentElement.scrollTop || document.body.scrollTop;
            var final = base + destPos.top - prevPos.top;

            // one's for chrome the other for firefox
            document.documentElement.scrollTop=final;
            document.body.scrollTop = final;
        }
    }
}

//⏪ ⏩
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
        var bwdButton = document.createElement('a');

        currentID.appendChild(bwdButton);
        bwdButton.class = "bwdButton";
        bwdButton.innerHTML = "⏪ ";
        bwdButton.onclick = function(){Jump(className,post,-1);};
        bwdButton.href = "javascript:void(0)";

        currentID.appendText = " ";

        var fwdButton = document.createElement('a');
        currentID.appendChild(fwdButton);
        fwdButton.class = "fwdButton";
        fwdButton.innerHTML = " ⏩";
        fwdButton.onclick = function(){Jump(className,post,1);};
        fwdButton.href = "javascript:void(0)";

        //postNrs are resolved and should be removed from this variable
        var idx = postNrs.indexOf(post.post_nr);
        if (idx > -1) {
            postNrs.splice(idx, 1);
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
setup();// ==UserScript==
// @name        IDJumper for 4chan
// @namespace   IDJumper.4chan
// @description Add button to jump to next post by same ID
// @author      ebinBuddha
// @include     http*://boards.4chan.org/pol/*
// @include     http*://boards.4chan.org/bant/*
// @exclude     http*://boards.4chan.org/pol/catalog
// @exclude     http*://boards.4chan.org/bant/catalog
// @version     0.1.1
// @grant       none
// @run-at      document-end
// @updateURL   https://github.com/ebinBuddha/ID-Jumper-for-4chan/raw/master/ID-Jumper-for-4chan.meta.js
// @downloadURL https://github.com/ebinBuddha/ID-Jumper-for-4chan/raw/master/ID-Jumper-for-4chan.user.js
// ==/UserScript==

var classes = [];
var ids     = [];

// retarded javascript is retarded
function mod(n, m) {
    return ((n % m) + m) % m;
}

/** parse the posts already on the page before thread updater kicks in */
function parseOriginalPosts() {
    var tempAllPostsOnPage = document.getElementsByClassName('postContainer');
    allPostsOnPage = Array.prototype.slice.call(tempAllPostsOnPage); //convert from element list to javascript array
    postNrs = allPostsOnPage.map(function (p) {
        return p.id.replace("pc", "");
    });
}


function Jump(className,post,dir) {
    var index = classes.indexOf(className);
    if (index >- 1) {
        var index2 = ids[index].indexOf("pc" + post);
        if (index2 >- 1 ) { // which should be ffs
            var len = ids[index].length;

            var dest = ids[index][mod(index2+dir,len)]; // get next post by same id, goes back from the first if last is clicked
            document.getElementById(dest).scrollIntoView();
        }
    }
}


//⏪ ⏩
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
        var bwdButton = document.createElement('a');

        currentID.appendChild(bwdButton);
        bwdButton.class = "bwdButton";
        bwdButton.innerHTML = "⏪ ";
        bwdButton.onclick = function(){Jump(className,post,-1);};
        bwdButton.href = "javascript:void(0)";

        currentID.appendText = " ";

        var fwdButton = document.createElement('a');
        currentID.appendChild(fwdButton);
        fwdButton.class = "fwdButton";
        fwdButton.innerHTML = " ⏩";
        fwdButton.onclick = function(){Jump(className,post,1);};
        fwdButton.href = "javascript:void(0)";

        //postNrs are resolved and should be removed from this variable
        var idx = postNrs.indexOf(post.post_nr);
        if (idx > -1) {
            postNrs.splice(idx, 1);
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