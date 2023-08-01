
let loginVisable = false;
let signupVisable = false;

function showlogin() {
    loginVisable = true;
    document.getElementById('login-overlay').style.display = 'block';
    document.getElementById('login').style.display = 'block';
    document.getElementById('login').style.top = '20vh';
    document.getElementById('login').style.opacity = 1;
    document.getElementById('login-overlay').style.opacity = 1;
}

function hidelogin() {
    loginVisable = false;
    document.getElementById('login').style.top = '25vh';
    document.getElementById('login').style.opacity = 0;
    document.getElementById('login-overlay').style.opacity = 0;
    setTimeout(()=>{
        document.getElementById('login-overlay').style.display = 'none';
        document.getElementById('login').style.display = 'none';
    }, 150);
}

function showsignup() {
    signupVisable = true;
    document.getElementById('signup-overlay').style.display = 'block';
    document.getElementById('signup').style.display = 'block';
    document.getElementById('signup').style.top = '20vh';
    document.getElementById('signup').style.opacity = 1;
    document.getElementById('signup-overlay').style.opacity = 1;
}

function hidesignup() {
    signupVisable = false;
    document.getElementById('signup').style.top = '25vh';
    document.getElementById('signup').style.opacity = 0;
    document.getElementById('signup-overlay').style.opacity = 0;
    setTimeout(()=>{
        document.getElementById('signup-overlay').style.display = 'none';
        document.getElementById('signup').style.display = 'none';
    }, 150);
}

/**
 * shows a generic error box at the top of the page, mostly
 * used to show connection errors or unexpected errors
 * 
 * @param {string} string // error string to show the user
 */
function error(string) {
    const errorElem = document.getElementById('error');
    errorElem.innerText = string;
    errorElem.style.display = 'block';
    errorElem.style.animation = 'showError 3s linear forwards';
    console.log(errorElem.style.animation);
    setTimeout(()=> errorElem.style.display = 'none', 3000);
}

function submitLogin(form) {
    
    form['0'].classList.remove('input-error');
    form['1'].classList.remove('input-error');

    let failed = false;
    if (!form['0'].value) {
        form['0'].classList.add('input-error');
        failed = true;
    }
    if (!form['1'].value) {
        form['1'].classList.add('input-error');
        failed = true;
    }
    if (failed) {
        loginError('Please fill out all fields!');
        return;
    }

    const req = new XMLHttpRequest();
    req.open('POST','/api/login');
    req.setRequestHeader('Content-type','application/json');
    req.onload = () => {

        if (req.status !== 200) {
            loginError('Login failed with unexpected error. Code: '+req.status);
            return;
        }

        const data = JSON.parse(req.responseText);
        switch (data.status) {
            case 'success':
                document.cookie = 'auth='+data.token+'; max-age='+(60*60*24*5)/* 5 days */+'; path=/; Samesite=Strict';
                window.location.reload();
                break;
            case 'invalid_credentials':
                loginError('Incorrect username or password!');
                break;
            default:
                loginError('Unexpected server response! Try again.');
        }
    };
    req.onerror = () => {
        error('Request failed! Check your internet and try again.');
    };
    req.send('{"email":"'+form['0'].value+'","password":"'+form['1'].value+'"}');
}

function loginError(string) {
    document.getElementById('login-error').style.display = 'block';
    document.getElementById('login-error').textContent = string;
}

function signupError(string) {
    document.getElementById('signup-error').style.display = 'block';
    document.getElementById('signup-error').textContent = string;
}

/**
 * function to run when the connection to the server has been lost that
 * pings the server until it gets a response (and blocks for that time if awaited)
 * also shows an error box to the user
 * 
 * @param {string} string  the error string to display to the user
 */
async function connectionError(string) {
    document.getElementById('error-box-text').innerText = string;
    document.getElementById('error-overlay').display = 'block';
    document.getElementById('error-box').display = 'block';
    document.getElementById('error-overlay').style.opacity = 1;
    document.getElementById('error-overlay').style.opacity = 1;

    while ((await ping()) !== 200) {
        await new Promise((resolve) => setTimeout(()=>resolve(),2000)); // sleep for 2s
    }
    
    document.getElementById('error-overlay').style.opacity = 0;
    document.getElementById('error-overlay').style.opacity = 0;

    setTimeout(()=>{
        document.getElementById('error-overlay').display = 'none';
        document.getElementById('error-box').display = 'none';
    },200);
}

/**
 * pings the server and returns the result (or 0 if network error)
 * 
 * @returns status of the request
 */
async function ping() {
    return new Promise((resolve) => {
        const req = new XMLHttpRequest();
        req.open('/api/ping','GET');
        req.onload = () => resolve(req.status)
        req.onerror = () => resolve(0);
        req.send();
    });
}

let skip = 0; // keeps track of what post number to load

/**
 * loads the next 10 posts and adds them to the feed
 * 
 */
function loadNext() {
    let req = new XMLHttpRequest();
    req.open('GET', '/api/fetch/next?skip='+skip);
    req.onload = () => {
        if (req.status !== 200) {
            error('Couldn\'t load posts! Error code: '+req.status)
            return;
        }

        for (const postData of JSON.parse(req.response))
            loadPost(postData);

        skip += 10;
    }
    req.onerror = () => {
        error('Request failed! Check your internet.');
    }
    req.send();
}

/**
 * appends a post to the feed based on the json data passed to it
 * 
 * @param {JsonPostData} data  the data for the post including post title and body
 */
function loadPost(data) {

    if (data.Type !== 'TEXT' && data.Type !== 'IMAGE') return; // only text and images are supported so far

    // first build the info header (saying the community and who posted it)
    const communityElem = document.createElement('community');
    communityElem.innerText = data.Community.Name;
    const authorElem = document.createElement('author');
    authorElem.innerText = data.Author.DisplayName;
    const infoElem = document.createElement('post-header');
    infoElem.append('Community: ',communityElem,' Author: ',authorElem);

    // then create the post data, title + body
    const titleElem = document.createElement('title');
    titleElem.innerText = data.Title;
    let imgElem;
    if (data.Type === 'IMAGE' && data.Url) {
        imgElem = document.createElement('img');
        imgElem.src = './images/'+data.Url;
        imgElem.alt = 'post image';
    }
    const bodyPreviewElem = document.createElement('body');
    bodyPreviewElem.innerText = data.Body.length > 256 ? data.Body.slice(0,256)+'...' : data.Body;

    // then build the post from those
    const post = document.createElement('post');
    post.append(infoElem,titleElem,imgElem ?? '',bodyPreviewElem);

    // add event listeners
    const [authorID, communityID, postID] = [data.Author.UserID, data.Community.CommunityID, data.PostID];

    post.onclick = (event) => {
        displayPost(post,postID,true)
        event.stopPropagation();
    };
    communityElem.onclick = (event) => {
        displayCommunity(communityID,true);
        event.stopPropagation();
    };
    authorElem.onclick = (event) => {
        displayUserProfile(authorID,true);
        event.stopPropagation();
    };

    // finally, append it to the feed
    document.getElementById('posts-feed').appendChild(post);
}


let onPostsFeed = true; // if currently showing the feed or something else
let oldScrollPos = 0; // scroll pos to go to when switching back to feed

/**
 * switches the page content to a specific post and saves old content for
 * fast return to feed also saves scroll position
 * 
 * @param {HTMLElement} post  post element that was clicked on
 * @param {string} postID  id of the post that was clicked on
 * @param {boolean} save  whether to save old state or not
 */
function displayPost(post,postID,save) {

    const req = new XMLHttpRequest();
    req.open('GET','/api/fetch/post?id='+postID);
    req.onload = () => {
        
        switch (req.status) {
            case 404:
                error('Invalid post ID!');
                return;
            case 200:
                break;
            default:
                error('Unexpected error! Code: '+req.status);
                return;
        }

        const content = document.getElementById('content');

        if (save) {
            oldScrollPos = document.documentElement.scrollTop || document.body.scrollTop;

            document.getElementById('tmp-storage').innerText = '';
            document.getElementById('tmp-storage').append(...content.childNodes);
        }

        content.innerText = ''; // clear visable content

        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;


        const data = JSON.parse(req.response);

        if (data.Type !== 'TEXT' && data.Type !== 'IMAGE') return; // only text and images are supported so far

        // first build the header (saying the community and who posted it and a back button)
        const communityElem = document.createElement('community');
        communityElem.innerText = data.Community.Name;
        const authorElem = document.createElement('author');
        authorElem.innerText = data.Author.DisplayName;
        const infoElem = document.createElement('post-header');
        infoElem.append('Community: ',communityElem,' Author: ',authorElem);

        // then create the post data, title + body
        const titleElem = document.createElement('title');
        titleElem.innerText = data.Title;
        let imgElem;
        if (data.Type === 'IMAGE' && data.Url) {
            imgElem = document.createElement('img');
            imgElem.src = './images/'+data.Url;
            imgElem.alt = 'post image';
        }
        const bodyPreviewElem = document.createElement('body');
        bodyPreviewElem.innerText = data.Body;

        const backbutton = document.createElement('back-button');

        // then build the post from those
        const post = document.createElement('post');
        post.append(backbutton,infoElem,titleElem,imgElem ?? '',bodyPreviewElem);

        // add event listeners
        const [authorID, communityID, postID] = [data.Author.UserID, data.Community.CommunityID, data.PostID];

        backbutton.onclick = (event) => {
            goBack();
            event.stopPropagation();
        };
        communityElem.onclick = (event) => {
            displayCommunity(communityID,false);
            event.stopPropagation();
        };
        authorElem.onclick = (event) => {
            displayUserProfile(authorID,false);
            event.stopPropagation();
        };

        document.getElementById('banner').style.display = 'none';

        content.appendChild(post);

    };
    req.onerror = () => {
        error('Request failed! check your internet.');
    };
    req.send();
}

/**
 * goes back to the old saved state
 * 
 */
function goBack() {
    const tmpStorage = document.getElementById('tmp-storage');

    document.getElementById('banner').style.display = 'flex';

    document.getElementById('content').innerText = '';
    document.getElementById('content').append(...tmpStorage.childNodes);

    document.documentElement.scrollTop = oldScrollPos;
    document.body.scrollTop = oldScrollPos;

    tmpStorage.innerText = '';
}
