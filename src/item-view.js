import './action-bar';
import anime from 'animejs/lib/anime.es.js';
import { isMobile, translationObject, showLoader, getConfig, showAlert, dismissLoader } from './helper'


const axios = require('axios').default;
const qs = require('qs');
const onlineDeliveryIcon = `
	<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="32" height="32" viewBox="0 0 54 54">
		<defs>
			<rect id="rect-5" width="40" height="40" x="7" y="7"/>
			<mask id="mask-6" maskContentUnits="userSpaceOnUse" maskUnits="userSpaceOnUse">
				<rect width="54" height="54" x="0" y="0" fill="black"/>
				<use fill="white" xlink:href="#rect-5"/>
			</mask>
		</defs>
		<ellipse cx="27" cy="27" fill="rgb(230,51,51)" rx="27" ry="27"/>
		<path fill="rgb(255,255,255)" fill-rule="evenodd" d="M27 45.33333333c-.46 0-.83333333-.37333333-.83333333-.83333333v-3.33333333c0-.46.37333333-.83333334.83333333-.83333334.46 0 .83333333.37333334.83333333.83333334V44.5c0 .46-.37333333.83333333-.83333333.83333333z"/>
		<ellipse cx="27" cy="37.833" fill="rgb(255,255,255)" rx="1.667" ry="1.667"/>
		<rect width="38.333" height="1.667" x="7.833" y="33.667" fill="rgb(255,255,255)" rx="0" ry="0"/>
		<use fill="none" xlink:href="#rect-5"/>
		<g mask="url(#mask-6)">
		<path fill="rgb(255,255,255)" fill-rule="evenodd" d="M43.66666794 42.00000095H10.33333302C8.49499989 42.00000095 7 40.43833255 7 38.519166V13.81416607c0-1.91916657 1.49499989-3.48083305 3.33333302-3.48083305h33.33333492C45.50500107 10.33333302 47 11.8949995 47 13.81416607v24.70499992c0 1.91916657-1.49499893 3.48083496-3.33333206 3.48083496zM10.33333397 12c-.91916657 0-1.66666699.81416702-1.66666699 1.81416702V38.519166c0 1 .74750042 1.81417084 1.66666699 1.81417084h33.33333397c.91916656 0 1.66666794-.81417084 1.66666794-1.81417084V13.81416702c0-1-.74750138-1.81416702-1.66666794-1.81416702H10.33333397zm4.99999905 33.33333683h23.3333311c.4600029 0 .83333588-.37333298.83333588-.83333588 0-.45999908-.37333298-.83333206-.83333588-.83333206h-23.3333311c-.46000004 0-.83333302.37333298-.83333302.83333206 0 .4600029.37333298.83333588.83333302.83333588z"/>
		</g>
	</svg>
`;

let emailFieldValid = false;
let nameFieldValid = false;

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

    render() {
        this.shadow.innerHTML = `
            <style>
                h2 {
                    color: var(--color-primary);
                    font-size: 1.2rem;
                }

				.header {
					display: flex;
					justify-content: space-between;
					align-items: center;
				}

				button {
					font-family: ITCAvantGardeStd;
					margin-top: 10px;
					font-size: medium;
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
                    background-color: var(--color-primary);
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

				button:disabled {
					background: var(--color-secondary)
				}

				.online-delivery-holder {
					display: flex;
					flex: 1;
					justify-content: flex-end;
				}

				.online-delivery {
					display: flex;
					align-items: center;
					border-radius: 12px;
				}

				.mobile-margin {
					margin-top: 15px!important;
				}

				.small {
					font-size: 14px;
					color: #3e3e3e;
					padding: 0;
					margin: 0;
					font-style: oblique;
				}

				#online-label {
					display: none;
					opacity: 0;
					color: #FFF;
					padding-right: 5px;
					cursor: default;
				}

				#online-icon {
					width: 32px;
					display: flex;
					align-items: center;
				}

                #item-details {
                    width: 100%;
                    margin-left: 0;
                    opacity: 0;
					box-sizing: border-box;
					padding-bottom: 30px;
                }
				
				#item-details {
					padding: 0 15px;
					margin-top: 55px;
				}

				#header-title {
					display: flex;
					flex-direction: column;
				}

				#header-title > h2 {
					margin: 0;
					padding: 0;
				}

				i {
					font-family: "findAnAlpha";
					font-style: normal;
					text-transform: none;
					margin-right: 5px;
				}
            </style>
            <div id="item-details" class="${isMobile() ? 'mobile-margin' : 'item-det'}">
				<div class="header">
					<div id="header-title">
						<h2>${this.alpha.title}</h2>
					</div>
				</div>
				<p>${this.alpha.onlineDelivery === 'Online' ? (translationObject()?.hostedOnlineText ? translationObject()?.hostedOnlineText : 'This course is hosted online') : ''}</p>
                <p style="display: ${this.alpha.demographic ? 'block' : 'none'}">
					${translationObject()?.findDetailType ? translationObject().findDetailType : 'Type'}: ${this.alpha.demographic}</p>
                <p style="text-transform: capitalize; display: flex; align-items: center;"><i>b</i> ${this.alpha.formattedDate}</p>
                <p>${this.alpha.formattedTime}</p>
                <p><span>${translationObject()?.findDetailLocation ? translationObject().findDetailLocation : 'Location' }</span>: ${this.alpha.formatted_address ? this.alpha.formatted_address : this.alpha.location.address}</p>
                <p>${this.alpha.additional_information}</p>
                <p>${translationObject()?.findMoreInfo ? translationObject().findMoreInfo : 'For more information about this Alpha, please contact the organizer below.'}</p>
				<br>
                <form id="contact-form">
                    <div class="inputs-holder">
                        <div class="input-container">
                            <input type="text" name="name" id="name" placeholder="Name*" required />
                        </div>
                        <div class="input-container">
                            <input type="email" name="email" id="email" placeholder="Email*" required />
                        </div>
                    </div>
                    <button type="button" id="signup" class="signup" disabled>${translationObject()?.signupButton ? translationObject()?.signupButton : 'Signup to attend' }</button
                </form>
            </div>
        `;
        this.animate();
        this.setMarkerOnMap();
		this.listenToSubmit();
		this.validateForm();
    }

	listenToSubmit() {
		this.shadow.querySelector('#signup').addEventListener('click', () => {
			const name = this.shadow.getElementById('name').value;
			const email = this.shadow.getElementById('email').value;
			this.signupToAttend(name, email);
		});
	}

	validateForm() {
		let submitButton = this.shadow.querySelector('#signup');

		this.shadow.querySelector('#email').addEventListener('keyup', (e) => {
			const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
			emailFieldValid = re.test(String(e.target.value).toLowerCase());

			submitButton.disabled = true;
			if (emailFieldValid && nameFieldValid) {
				submitButton.disabled = false;
			}
		});

		this.shadow.querySelector('#name').addEventListener('keyup', (e) => {
			e.target.value.length ? nameFieldValid = true : nameFieldValid = false;

			submitButton.disabled = true;
			if (nameFieldValid && emailFieldValid) {
				submitButton.disabled = false;
			}
		});
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
            delay: anime.stagger(100, {start: 0})
        })
    }

	signupToAttend(name, email) {
		showLoader();
		let contactObj = {
			id: this.alpha.id,
			email: email,
			name: name
		};
		// The `blog_id` attribute is only provided in cases the source of the request comes from
		// a global site.
		if (this.alpha.blog_id) {
			contactObj.blog_id = this.alpha.blog_id;
		}
		const reqObj = qs.stringify(contactObj);
		const endPoint = getConfig()?.contactApi ? getConfig().contactApi : 'https://alphabuilderadmin.com/wp-json/wp/v2/alpha/contact';
		axios.post(endPoint, reqObj, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })
			.then(res => {
				showAlert(false, translationObject()?.alphaQuickRegisterResponse
										? translationObject()?.alphaQuickRegisterResponse 
										: 'Thank you for registering for this Alpha. An organizer of this course will be in touch with you shortly with further details.' )
			})
			.catch((e) => console.log(e))
			.finally(() => dismissLoader() )
	}
}

customElements.define('faa-item', ItemView);
