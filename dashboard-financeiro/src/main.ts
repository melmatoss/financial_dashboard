import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app';

async function enableMocking() {
  const { worker } = await import('./app/mocks/browser');
  return worker.start();
}

enableMocking().then(() => {
  bootstrapApplication(AppComponent, appConfig)
    .catch(err => console.error(err));
}); 