import * as React from 'react';
import * as ReactDOM from 'react-dom';
import './index.css';
import * as serviceWorker from './serviceWorker';
import { applyMiddleware, AnyAction, createStore, Store } from 'redux';
import thunkMiddleware, { ThunkMiddleware } from 'redux-thunk'
import Syncr from '@cerp/syncr'

import Routes from './routes'
import reducer from './reducers'

import { connected, disconnected } from './actions/core'

import { loadDB, saveDB } from './utils/localStorage'
import debounce from './utils/debounce';


const debug_url = "wss://socket.ilmexchange.com/ws"
// const debug_url = 'socket.ilmexchange.com'
//@ts-ignore
const host = window.api_url || debug_url;

const initial_state = loadDB()
const syncr = new Syncr(host)

//@ts-ignore
syncr.on('connect', () => store.dispatch(connected()))
syncr.on('disconnect', () => store.dispatch(disconnected()))
syncr.on('message', (msg: AnyAction) => store.dispatch(msg))

//@ts-ignore
const store: Store<RootReducerState> = createStore(
	reducer,
	initial_state,
	applyMiddleware(thunkMiddleware.withExtraArgument(syncr))
)

const saveBounce = debounce(() => {
	console.log('saving')
	const state = store.getState();
	saveDB(state)
}, 500);

store.subscribe(saveBounce as () => void)
ReactDOM.render(<Routes store={store} />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.register();
