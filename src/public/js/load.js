

document.addEventListener('keyup',(event) => {
    if (event.key === 'Escape') {
        if (loginVisable) hidelogin();
        else if (signupVisable) hidesignup();
    }
});

let userID;

if (document.cookie.includes('auth=')) {
    //let auth = JSON.parse(atob(document.cookie.split('auth=')[1].split('; ')[0].split('.')[1]));
    load()
} else {
    console.log('not logged in!')
}

function load() {
    let error = 5;

    let req = new XMLHttpRequest();
    req.open('GET', '/api/profile');
    req.onload = () => {


        switch (req.status) {

            case 200:
                break;

            case 401:
                document.cookie = 'auth=; path=/; max-age=-99; Samesite=Strict;'
                return;

            default:
                return;
        }

        if (req.status !== 200) return;

        let profile = JSON.parse(req.responseText);

        document.getElementById('profile').innerHTML = '<user><div id="name"></div><dropdown-arrow>&lt</dropdown-arrow></user>';

        document.getElementById('name').innerText = profile.DisplayName;

    }
    req.onerror = () => {
        if (--error) {
            error = 5;
            connectionFailure();
        } else
            setTimeout(req.send.bind(req),1000);
    }

    req.send();

}

loadNext();
