
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

let lastUpdate = 0; // when the posts were last loaded in
let loadFailed = false; // if the last page load failed or not

/**
 * funtion that is run on scroll events which loads the next posts
 * if the user is near the bottom of the page
 */
function scrollHandler() {

    const scrollHeight = document.body.scrollHeight-(window.innerHeight+window.scrollY);
    if (scrollHeight>300) return;

    if (scrollHeight || loadFailed) {
        const timeoutTime = (new Date()).getTime()-lastUpdate;
        if (timeoutTime < 500 || (loadFailed && timeoutTime < 5000)) return;
    }

    lastUpdate = (new Date()).getTime();

    loadNext(true);
}

/**
 * validates the login form data and process the login
 * 
 * @param {HTMLFormElement} form  the form that was submitted
 */
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
                break;
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

/**
 * validates the signup form data and process the signup
 * 
 * @param {HTMLFormElement} form  the form that was submitted
 */
function submitSignup(form) {
    
    let failed = false;

    for (let i = 0; i < 6; i++) {
        form[i].classList.remove('input-error');
        if (!form[i].value) {
            form[i].classList.add('input-error');
            failed = true;
        }
    }

    if (failed) {
        signupError('Please fill out all fields!');
        return;
    }

    console.log(form);

    // name validation
    if (form[0].value.length > 48) {
        form[0].classList.add('input-error');
        signupError('Name too long. Max length 48 characters');
        return;
    }
    if (form[0].value.length < 2) {
        form[0].classList.add('input-error');
        signupError('Name too short');
        return;
    }

    // email validation
    if (!form[1].value/*.contains('@')*/) {
        form[1].classList.add('input-error');
        signupError('Please enter a valid email address');
        return;
    }

    // password validation
    if (form[3].length < 11) {
        form[1].classList.add('input-error');
        signupError('Password must be 11 characters or more');
        return;
    }

    if (form[3].value != form[4].value) {
        form[4].classList.add('input-error');
        signupError('Passwords dont\'t match');
        return;
    }



    const req = new XMLHttpRequest();
    req.open('POST','/api/signup');
    req.setRequestHeader('Content-type','application/json');
    req.onload = () => {

        if (req.status !== 200) {
            signupError('Login failed with unexpected error. Code: '+req.status);
            return;
        }

        const data = JSON.parse(req.responseText);
        switch (data.status) {
            case 'success':
                hidesignup();
                showlogin();
                // TODO: display a success message first
                break;
            case 'failed':
                switch (data.reason) {
                    case 'email_in_use':
                        signupError('Incorrect username or password!');
                        break;
                    case 'display_name_unavailable':
                        signupError('Display name unavailable!');
                        break;
                }
                break;
            default:
                signupError('Unexpected server response! Try again.');
                break;
        }
    };
    req.onerror = () => {
        error('Request failed! Check your internet and try again.');
    };
    req.send(`{"name":"${form[0].value}","email":"${form[1].value}","displayName":"${form[2].value}","dob":"${form[3].value}","password":"${form[4].value}"}`);
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
let currURI; // current URI (so loadNext() can be called from scroll handler without needing context)

/**
 * loads the next 10 posts and adds them to the feed
 * 
 * @param {boolean} retry whether to retry the request or not
 * @returns {boolean} true if loaded more posts, false if failed
 */
function loadNext(retry) {
    let req = new XMLHttpRequest();
    req.open('GET', currURI+skip);
    req.onload = () => {
        if (req.status !== 200) {
            if (retry) setTimeout(loadNext.bind(null,false),3000);
            loadFailed = true;
            error('Couldn\'t load posts! Error code: '+req.status);
            return;
        }

        const data = JSON.parse(req.response);

        if (!data.length) {
            loadFailed = true;
            return;
        }

        for (const postData of data)
            loadPost(postData);

        skip += data.length;
    }
    req.onerror = () => {
        if (retry) setTimeout(loadNext.bind(null,false),3000);
        loadFailed = true;
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

    const readButton = document.createElement('button');
    readButton.innerText = "Read description out loud.";
    const description = data.Description;
    readButton.onclick = (e) => {
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(new SpeechSynthesisUtterance(description));
        e.stopPropagation();
    }

    // first build the info header (saying the community and who posted it)
    const communityElem = document.createElement('community');
    communityElem.innerText = data.Community.Name;
    const authorElem = document.createElement('author');
    authorElem.innerText = data.Author.DisplayName;
    const infoElem = document.createElement('post-header');
    infoElem.append('Community: ',communityElem,' Author: ',authorElem,readButton);

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
    data.Body = data.Body.replace("${description}",data.Description);
    bodyPreviewElem.innerText = data.Body.length > 256 ? data.Body.slice(0,256)+'...' : data.Body;

    // then build the post from those
    const post = document.createElement('post');
    post.append(infoElem,titleElem,imgElem ?? '',bodyPreviewElem);

    // add event listeners
    const [authorID, communityID, postID] = [data.Author.UserID, data.Community.CommunityID, data.PostID];

    post.onclick = (event) => {
        displayPost(post,postID,true);
        event.stopPropagation();
    };
    communityElem.onclick = (event) => {
        displayCommunity(communityID,true);
        event.stopImmediatePropagation();
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

        const readButton = document.createElement('button');
        readButton.innerText = "Read description out loud.";
        const description = data.Description;
        readButton.onclick = (e) => {
            window.speechSynthesis.cancel();
            window.speechSynthesis.speak(new SpeechSynthesisUtterance(description));
            e.stopPropagation();
        }

        // first build the header (saying the community and who posted it and a back button)
        const communityElem = document.createElement('community');
        communityElem.innerText = data.Community.Name;
        const authorElem = document.createElement('author');
        authorElem.innerText = data.Author.DisplayName;
        const infoElem = document.createElement('post-header');
        infoElem.append('Community: ',communityElem,' Author: ',authorElem,readButton);

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
        bodyPreviewElem.innerText = data.Body.replace("${description}",data.Description);

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

/**
 * searches for the search string in the search input and displays the results
 */
function search() {
    const searchString = document.getElementById('search-input').value;

    if (!searchString) return;

    currURI = '/api/search/posts?param='+encodeURIComponent(searchString)+'&skip=';

    let req = new XMLHttpRequest();
    req.open('GET', currURI+0);
    req.onload = () => {
        if (req.status !== 200) {
            error('Couldn\'t load posts! Error code: '+req.status)
            return;
        }

        document.getElementById('posts-feed').innerText = '';

        const data = JSON.parse(req.response);

        if (!data.length) {
            document.getElementById('posts-feed').innerHTML = '<post><body>No posts match your search.</body></post>'
        }

        for (const postData of data)
            loadPost(postData);

        skip = data.length;
    }
    req.onerror = () => {
        error('Request failed! Check your internet.');
    }
    req.send();
}
