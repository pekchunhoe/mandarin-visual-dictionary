import { Component } from 'react';
import type { ReactNode } from 'react';
export class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? <main className="empty-state" role="alert"><h1>Let’s open a fresh page.</h1><p>Something went wrong while displaying this word. Your saved words are still on this device.</p><button className="primary-button" onClick={() => { location.hash = ''; location.reload(); }}>Return to the dictionary</button></main> : this.props.children; }
}
