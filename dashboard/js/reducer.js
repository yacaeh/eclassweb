var reactEvent = {};
window.params = GetParamsFromURL();

const CHANGE_LANGUAGE = 'CHANGE_LANGUAGE';
const SET_CLASSROOM_INFO = 'SET_CLASSROOM_INFO';
const CHANGE_CAMVIEW = 'CHANGE_CAMVIEW';

const InitData = {
    isOwner: window.params.open == "true",
    isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
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


function reducer(state = InitData, action) {
    switch (action.type) {
        case CHANGE_LANGUAGE:
            state.language = action.data;
            break;
        case SET_CLASSROOM_INFO:
            state.classroomInfo = action.data;
            break;
        case CHANGE_CAMVIEW:
            state.nowView = action.data;
            break;
    }
    console.log(state);
    return state;
}

function GetLang(msg) {
    return store.getState().language[msg];
}