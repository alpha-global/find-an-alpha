import { isMobile, actionBar, removeAllAttributes, goHome, translationObject } from './helper';
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
            newVal ? (backBtn.style.display = 'flex') : (backBtn.style.display = 'none');
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
                    removeAllAttributes(itemEl);
					
                    const listEl = document.querySelector('find-a-course').shadowRoot.querySelector('faa-list-view').style.display = 'block';
                    this.shadowRoot.getElementById('back-button').style.display = 'none';
					
					if (isMobile()) {
						actionBar('remove')
					}
                }
            });
            
        });

        this.shadow.getElementById('edit-search-button').addEventListener('click', () => {
            goHome()
        });
    }

    render() {
        this.shadow.innerHTML = `
            <style>
				i {
					font-family:"findAnAlpha";
					font-style: normal;
					margin-right: 5px;
				}

                #action-bar {
                    width: 49%;
					position: fixed;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    height: 45px;
					box-shadow: 0 5px 11px -5px #e3e3e3;
					z-index: 1;
					background: #fff;
                }

				.mobile-back-button {
					justify-content: flex-end!important;
				}

				.mobile-action-bar {
					width: 100%!important;
					position: relative!important;
				}

				@media only screen and (max-width: 600px) {
					#action-bar {
						width: calc(100% - 20px);
					}
				}

                #back-button, #edit-search-button {
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                }

				span {
					display: flex;
					align-items: flex-end;
				}

                #back-button {
                    display: none;
                }
            </style>

            <div id="action-bar" class="${isMobile() ? 'mobile-back-button mobile-action-bar' : 'desktop-back-button'}">
                <div id="edit-search-button" >
                    <span><i>f</i>${translationObject()?.findEditSearchButton ? translationObject().findEditSearchButton : 'Edit Search'}</span>
                </div>
                <div id="back-button">
                   <span><i>d</i> ${translationObject()?.findBackButton ? translationObject().findBackButton : 'Back'}</span>
                </div>
            </div>
        `;
        this.initListeners();

		if (isMobile()) {
			this.shadow.querySelector('#edit-search-button').style.display = 'none';
		}
    };


}

customElements.define('faa-action-bar', ActionBar);
