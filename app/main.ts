import { ViteSSG } from 'vite-ssg/single-page';
import 'virtual:uno.css';
import 'vfonts/Lato.css';
import './style.scss';
import App from './App';

if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .getRegistrations()
    .then(registrations =>
      Promise.all(registrations.map(registration => registration.unregister()))
    )
    .then(() => caches.keys())
    .then(keys => Promise.all(keys.map(key => caches.delete(key))))
    .catch(() => {});
}

export const createApp = ViteSSG(App);
