import './action-bar';
import anime from 'animejs/lib/anime.es.js';
import * as helper from './helper';

class ItemView extends HTMLElement {
    constructor() {
        super();
        this.shadow = this.attachShadow( { mode: 'open' } );
    }

    get alpha() {
        const a = this.getAttribute('alpha');
        const parsedAlpha = JSON.parse(a);
        return parsedAlpha;
    }

    static get observedAttributes() {
        return ['alpha']
    }

    attributeChangedCallback(prop, oldVal, newVal) {
        if (prop === 'alpha') {
            if (newVal) {
                this.render();
            }
        }
    }
    // connectedCallback() {
    //     this.render();
    // }

    render() {
        this.shadow.innerHTML = `
            <style>
                h2 {
                    color: #ff0000;
                    font-size: 1.2rem;
                }

				#item-details {
					padding: 0 15px;
				}

				button {
					font-family: ITCAvantGardeStd;
					margin-top: 10px;
				}

                .inputs-holder {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

				@media only screen and (max-width: 600px) {
					.inputs-holder {
						flex-direction: column;
					}

					input {
						margin: 5px 0;
					}
				}

                .signup {
                    width: 100%;
                    background-color: #ff0000;
                    color: #FFF;
                    height: 50px;
                    border: none;
                    shadow: none;
					margin-top: 10px;
                }
                
                input {
                    -moz-appearance: none;
                    appearance: none;
                    border: 1px solid #f1f1f1;
                    -webkit-box-sizing: border-box;
                    box-sizing: border-box;
                    -webkit-transition: all .3s ease-in-out;
                    transition: all .3s ease-in-out;
                    outline: 0;
                    color: #5d6368;
                    display: block;
                    width: 99%;
                    height: 50px;
                    padding: 0 24px;
                    font-size: 16px;
                    line-height: 1.75;
                    background-image: none;
                }

                .input-container {
                    flex: 1;
					width: 100%;
                }

                #item-details {
                    width: 100%;
                    margin-left: 0;
                    opacity: 0;
					box-sizing: border-box;
					padding-bottom: 30px;
                }
            </style>
            <div id="item-details">
                <h2>${this.alpha.title}</h2>
				<p>${helper.translationObject().demographic ?? '' }</p>
                <p>${this.alpha.formattedDate}</p>
                <p>${this.alpha.formattedTime}</p>
                <p><span>${helper.translationObject().findDetailLocation ?? 'Location' }</span>: ${this.alpha.location.address ? this.alpha.location.address : this.alpha.formatted_address}</p>
                <p>${this.alpha.additional_information}</p>
                <br>
                <p>${helper.translationObject().findMoreInfo || 'For more information about this Alpha, please contact the organizer below.'}</p>
                <br>
                <form id="contact-form">
                    <div class="inputs-holder">
                        <div class="input-container">
                            <input type="text" name="name" id="name" placeholder="Name"></input>
                        </div>
                        <div class="input-container">
                            <input type="email" name="email" id="email" placeholder="Email"></input>
                        </div>
                    </div>
                    <button type="button" class="signup">Signup to attend</button
                </form>
            </div>
        `;
        this.animate();
        this.setMarkerOnMap();
    }

    setMarkerOnMap() {
        document.querySelector('find-a-course').setAttribute('selectedalpha', JSON.stringify(this.alpha));
    }

    animate() {
        const itemDetails = this.shadow.querySelectorAll('#item-details');
        const h2 = this.shadow.querySelectorAll('h2');
        const p = this.shadow.querySelectorAll('p');
        const form = this.shadow.querySelectorAll('form');
        anime({
            targets: [itemDetails, h2, p, form],
			translateX: [250, 0],
            opacity: 1,
            delay: anime.stagger(100, {start: 0}),
        })
    }

    // dismissWindow() {
    //     const resultList = document.querySelector('find-a-course')
    //                        .shadowRoot.querySelector('faa-form')
    //                        .shadowRoot.querySelector('faa-list-view')
    //                        .shadowRoot.getElementById('result-list');
    //     resultList.style.display = 'block';
    //     this.remove();
    // }
}

customElements.define('faa-item', ItemView);
