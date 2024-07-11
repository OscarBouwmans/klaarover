import { $didRender, ComponentInstance } from './component';

export function render(container: Node, component: ComponentInstance) {
  const children = [...component.fragment.childNodes];
  container.appendChild(component.fragment);
  component[$didRender](container, children);
}

export function renderBefore(sibling: Node, component: ComponentInstance) {
  const children = [...component.fragment.childNodes];
  sibling.parentElement!.insertBefore(component.fragment, sibling);
  component[$didRender](sibling.parentNode!, children);
}
