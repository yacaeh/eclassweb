var reactEvent = {
    AlertBox : function({title,content,yes,removeNo}){},
    navigation : {},
};

window.params = GetParamsFromURL();

const CHANGE_LANGUAGE       = 'CHANGE_LANGUAGE';
const SET_CLASSROOM_INFO    = 'SET_CLASSROOM_INFO';
const CHANGE_CAMVIEW        = 'CHANGE_CAMVIEW';
const PERMISSION_CHANGED    = 'PERMISSION_CHANGED';

const InitData = {
    isOwner: window.params.open == "true",
    isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
    userName : window.params.userFullName,
    sessionID : window.params.sessionid,
    classroomInfo : {
        allControl : false
    },
    features : {},
    permissions : {
        canvas : false,
        mic : false,
        screen : false
    }

};

const store = Redux.createStore(reducer);
Init();

function Init() {
    if (!localStorage.getItem("locale")) {
        localStorage.setItem('locale', 'en');
    }
    axios.get('/dashboard/js/languages/' + localStorage.getItem('locale') + '.json').then((e) => {
        let action = { type: CHANGE_LANGUAGE, data: e.data };
        store.dispatch(action);
        document.title = e.data.TITLE;
    });
}

// https://velopert.com/1266

function reducer(state = InitData, action) {
    switch (action.type) {
        case CHANGE_LANGUAGE:
            return Object.assign({}, state, {
                language : action.data
            })
        case SET_CLASSROOM_INFO:
            return Object.assign({}, state, {
                classroomInfo : action.data
            })
        case CHANGE_CAMVIEW:
            return Object.assign({}, state, {
                nowView : action.data
            })
        case PERMISSION_CHANGED :
            return Object.assign({}, state, {
                permissions : action.data
            })
    }
    console.log(state);
    return state;
}

function GetLang(msg) {
    return store.getState().language[msg];
}