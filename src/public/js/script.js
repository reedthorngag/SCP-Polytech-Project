
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
        const data = JSON.parse(req.responseText)
        switch (data.status) {
            case 'success':
                document.cookie = 'auth='+data.token+'; max-age='+(60*60*24*5)/* 5 days */+'; path=/; Samesite=Strict';
                window.location.reload();
                break;
            case 'invalid_credentials':
                loginError('Incorrect username or password!');
                break;
            default:
                loginError('Unexpected server response! try again.')
        }
    };
    req.onerror = () => {
        switch (req.status) {
            case 404:
                loginError('Not connected! check your internet.');
            default: console.log("Error, unknown status: "+req.status);
                break;
        }
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
        if (req.status !== 200) return;

        for (const postData of JSON.parse(req.response))
            loadPost(postData);

        skip += 10;
    }
    req.send();
}

/**
 * appends a post to the feed based on the json data passed to it
 * 
 * @param {JsonPostData} data  the data for the post including post title and body
 */
function loadPost(data) {

    if (data.Type !== 'TEXT') return; // only text is supported so far

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
    const bodyPreviewElem = document.createElement('body-preview');
    bodyPreviewElem.innerText = data.Body.length > 256 ? data.Body.slice(0,256) : data.Body;

    // then build the post from those
    const post = document.createElement('post');
    post.append(infoElem,titleElem,bodyPreviewElem);

    // add event listeners
    const [authorID, communityID, postID] = [data.Author.UserID, data.Community.CommunityID, data.PostID];

    post.onclick = (event) => {
        console.log(postID);
        event.stopPropagation();
    };
    communityElem.onclick = (event) => {
        console.log(communityID);
        event.stopPropagation();
    };
    authorElem.onclick = (event) => {
        console.log(authorID);
        event.stopPropagation();
    };

    // finally, append it to the feed
    document.getElementById('posts-feed').appendChild(post);
}
