import { render } from '../..';
import App from './App.component';

const output = document.getElementById('app')!;
render(output, App());
