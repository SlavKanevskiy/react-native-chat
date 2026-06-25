/**
 * <chat-widget> — Custom Element that embeds the chat as an iframe.
 *
 * The iframe points to the Expo web app and passes autochat params via URL query string.
 * The Expo app reads them from window.location.search and auto-logs in.
 *
 * Attributes:
 *   chat-id   — Firestore chat document ID
 *   email     — autochat user email
 *   password  — autochat user password
 *   chat-name — display name shown in the chat header
 *   src       — base URL of the chat app (default: /chat/)
 *
 * Usage:
 *   <chat-widget
 *     chat-id="tW6zZJOe6aEdGuqk7jPa"
 *     email="global@123456.com"
 *     password="123456"
 *     chat-name="Global chat"
 *   ></chat-widget>
 */

class ChatWidgetElement extends HTMLElement {
  private _iframe: HTMLIFrameElement | null = null;

  static get observedAttributes() {
    return ['chat-id', 'email', 'password', 'chat-name', 'src'];
  }

  connectedCallback() {
    this._mount();
  }

  attributeChangedCallback() {
    if (this._iframe) this._updateSrc();
  }

  disconnectedCallback() {
    this._iframe = null;
  }

  private _buildSrc(): string {
    const base = this.getAttribute('src') ?? window.location.origin + '/';
    const params = new URLSearchParams({
      chatId:   this.getAttribute('chat-id')   ?? '',
      email:    this.getAttribute('email')      ?? '',
      password: this.getAttribute('password')  ?? '',
      chatName: this.getAttribute('chat-name') ?? '',
    });
    return `${base}?${params.toString()}`;
  }

  private _mount() {
    this.style.cssText = 'display:block;width:100%;height:100%;';

    const iframe = document.createElement('iframe');
    iframe.src = this._buildSrc();
    iframe.style.cssText = 'width:100%;height:100%;border:none;display:block;';
    iframe.allow = 'clipboard-write';

    this.appendChild(iframe);
    this._iframe = iframe;
  }

  private _updateSrc() {
    if (this._iframe) this._iframe.src = this._buildSrc();
  }
}

if (!customElements.get('chat-widget')) {
  customElements.define('chat-widget', ChatWidgetElement);
}
