import * as helper from './helper';
import anime from 'animejs/lib/anime.es.js';

/**
 * Class that contais the "Back" and "Edit Search" buttons.
 */
class ActionBar extends HTMLElement {

    constructor() {
        super();
        this.shadow = this.attachShadow( { 'mode': 'open' } );
    }

    connectedCallback() {
        this.render();
    }

    /**
     * Observers for changes on given attributes and re-renders the ui.
     * If the user selects an alpha for details, that component sets the 
     * `allowback` attribute to TRUE. When true it will show the back button
     * on the ui.
     */
    static get observedAttributes() {
        return ['allowback'];
    }

    /**
     * Observes for changes on all the attributes passed to this component
     * and reacts to them.
     * @param {*} prop 
     * @param {*} oldVal 
     * @param {*} newVal 
     */
    attributeChangedCallback(prop, oldVal, newVal) {
        if (prop === 'allowback') {
            const backBtn = this.shadow.getElementById('back-button');
            newVal ? (backBtn.style.display = 'block') : (backBtn.style.display = 'none');
        }
    }

    /**
     * Initiate all the listeners for this component.
     * @todo Refactor this.
     */
    initListeners() {
        this.shadow.getElementById('back-button').addEventListener('click', (e) => {
            const itemEl = document.querySelector('find-a-course').shadowRoot.querySelector('faa-item');
            anime({
                targets: [itemEl.shadowRoot.querySelector('#item-details')],
                translateX: -500,
                opacity: 0,
                duration: 700,
                complete: () => {
                    document.querySelector('find-a-course').shadowRoot.querySelector('#right-side').removeChild(itemEl);
                    helper.removeAllAttributes(itemEl);
        
                    const listEl = document.querySelector('find-a-course').shadowRoot.querySelector('faa-list-view').style.display = 'block';
                    this.shadowRoot.getElementById('back-button').style.display = 'none';
                }
            });
            
        });

        this.shadow.getElementById('edit-search-button').addEventListener('click', () => {
            helper.goHome()
        });
    }

    render() {
        this.shadow.innerHTML = `
            <style>
                #action-bar {
                    width: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    height: 45px;
                    border-bottom: 1px solid #cecece;
                }

                #back-button, #edit-search-button {
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                }

                #back-button {
                    display: none;
                }
            </style>

            <div id="action-bar">
                <div id="edit-search-button" >
                    <?xml version="1.0" ?><!DOCTYPE svg  PUBLIC '-//W3C//DTD SVG 1.1//EN'  'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd'><svg enable-background="new 0 0 64 64" height="20px" id="Layer_1" version="1.1" viewBox="0 0 64 64" width="20px" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g><path d="M55.736,13.636l-4.368-4.362c-0.451-0.451-1.044-0.677-1.636-0.677c-0.592,0-1.184,0.225-1.635,0.676l-3.494,3.484   l7.639,7.626l3.494-3.483C56.639,15.998,56.639,14.535,55.736,13.636z"/><polygon points="21.922,35.396 29.562,43.023 50.607,22.017 42.967,14.39  "/><polygon points="20.273,37.028 18.642,46.28 27.913,44.654  "/><path d="M41.393,50.403H12.587V21.597h20.329l5.01-5H10.82c-1.779,0-3.234,1.455-3.234,3.234v32.339   c0,1.779,1.455,3.234,3.234,3.234h32.339c1.779,0,3.234-1.455,3.234-3.234V29.049l-5,4.991V50.403z"/></g></svg>
                    <span>${helper.translationObject().findEditSearchButton || 'Edit Search'}</span>
                </div>
                <div id="back-button">
                    <?xml version="1.0" ?><!DOCTYPE svg  PUBLIC '-//W3C//DTD SVG 1.1//EN'  'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd'>
                    <svg height="18px" id="Layer_1" style="enable-background:new 0 0 32 32;" version="1.1" viewBox="0 0 32 32" width="18px" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><path d="M28,14H8.8l4.62-4.62C13.814,8.986,14,8.516,14,8c0-0.984-0.813-2-2-2c-0.531,0-0.994,0.193-1.38,0.58l-7.958,7.958  C2.334,14.866,2,15.271,2,16s0.279,1.08,0.646,1.447l7.974,7.973C11.006,25.807,11.469,26,12,26c1.188,0,2-1.016,2-2  c0-0.516-0.186-0.986-0.58-1.38L8.8,18H28c1.104,0,2-0.896,2-2S29.104,14,28,14z"/></svg>
                    <span>${helper.translationObject().findBackButton || 'Back'}</span>
                </div>
            </div>
        `;
        this.initListeners();
    };


}

customElements.define('faa-action-bar', ActionBar);
