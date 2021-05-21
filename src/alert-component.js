import anime from 'animejs/lib/anime.es.js';
import { isMobile } from './helper';

/**
 * Global Component to display alerts. It listens to 2 attributes,
 * `iserror` and 'message'.
 */
class Alert extends HTMLElement {
    constructor() {
        super();
        this.shadow = this.attachShadow( { mode: 'open' } );
    }

    /**
     * Gets the component attribute 'iserror' If TRUE it means
     * it's an error.
     * @returns boolean
     */
    get isError() {
        return this.getAttribute('iserror');
    }

    /**
     * Gets the component attribute for the message. If it's an
     * error or not, there should be a message.
     * @returns string
     */
    get message() {
        return this.getAttribute('message');
    }

    connectedCallback() {
        this.render();
    }

    render() {
		if (!isMobile()) {
			this.listenToClick();
		} else {
			setTimeout(() => {
				this.dismissAlert()
			}, 3500);
		}
        this.shadow.innerHTML = `
            <style>
                #backdrop {
                    width: 100%;
                    height: 100%;
                    background: rgba(255,255,255,.6);
                    position: absolute;
                    top: 0;
                    left: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                #alert-container {
                    width: 40%;
                    background: #FFF;
                    -webkit-box-shadow: 0px 0px 21px -8px #000000; 
                    box-shadow: 0px 0px 21px -8px #000000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 15px;
                    padding: 15px;
                    flex-direction: column;
                }

				@media only screen and (max-width: 600px) {
					#alert-container {
						width: 80%;
					}
				}

                #close-button {
                    position: absolute;
                    top: 15px;
                    right: 15px;
                    opacity: .4;
                    width: 25px;
                    content: url('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjxzdmcgaWQ9Ik91dGxpbmVkIiB2aWV3Qm94PSIwIDAgMzIgMzIiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHRpdGxlLz48ZyBpZD0iRmlsbCI+PHBhdGggZD0iTTE2LDJBMTQsMTQsMCwxLDAsMzAsMTYsMTQsMTQsMCwwLDAsMTYsMlptMCwyNkExMiwxMiwwLDEsMSwyOCwxNiwxMiwxMiwwLDAsMSwxNiwyOFoiLz48cG9seWdvbiBwb2ludHM9IjE5LjU0IDExLjA1IDE2IDE0LjU5IDEyLjQ2IDExLjA1IDExLjA1IDEyLjQ2IDE0LjU5IDE2IDExLjA1IDE5LjU0IDEyLjQ2IDIwLjk1IDE2IDE3LjQxIDE5LjU0IDIwLjk1IDIwLjk1IDE5LjU0IDE3LjQxIDE2IDIwLjk1IDEyLjQ2IDE5LjU0IDExLjA1Ii8+PC9nPjwvc3ZnPg==');
                }

                h2 {
                    color: #e42312;
                }

                h3 {
                    color: #3c3c3c;
                }

                .alert-icon {
                    width: 100px;
                    height: auto;
					margin: 20px auto;
                }

                #errorIcon {
                    fill: #e42312;
                }

				/* SVG ANIMATIONS */
				.ui-success,
				.ui-error {
					width: 100px;
					height: 100px;
				}
				.ui-success-circle {
					stroke-dasharray: 260.75219025px, 260.75219025px;
					stroke-dashoffset: 260.75219025px;
					transform-origin: center center;
					stroke-linecap: round;
					animation: ani-success-circle 1s ease-in both;
				}
				.ui-success-path {
					stroke-dasharray: 60px 64px;
					stroke-dashoffset: 62px;
					stroke-linecap: round;
					animation: ani-success-path 0.4s 1s ease-in both;
				}
				@keyframes ani-success-circle {
					to {
						stroke-dashoffset: 782.25657074px;
					}
				}
				@keyframes ani-success-path {
					0% {
						stroke-dashoffset: 62px;
					}
					65% {
						stroke-dashoffset: -5px;
					}
					84% {
						stroke-dashoffset: 4px;
					}
					100% {
						stroke-dashoffset: -2px;
					}
				}
				.ui-error-circle {
					stroke-dasharray: 260.75219025px, 260.75219025px;
					stroke-dashoffset: 260.75219025px;
					animation: ani-error-circle 1.2s linear;
				}
				.ui-error-line1 {
					stroke-dasharray: 54px 55px;
					stroke-dashoffset: 55px;
					stroke-linecap: round;
					animation: ani-error-line 0.15s 1.2s linear both;
				}
				.ui-error-line2 {
					stroke-dasharray: 54px 55px;
					stroke-dashoffset: 55px;
					stroke-linecap: round;
					animation: ani-error-line 0.2s 0.9s linear both;
				}
				@keyframes ani-error-line {
					to {
						stroke-dashoffset: 0;
					}
				}
				@keyframes ani-error-circle {
					0% {
						stroke-dasharray: 0, 260.75219025px;
						stroke-dashoffset: 0;
					}
					35% {
						stroke-dasharray: 120px, 120px;
						stroke-dashoffset: -120px;
					}
					70% {
						stroke-dasharray: 0, 260.75219025px;
						stroke-dashoffset: -260.75219025px;
					}
					100% {
						stroke-dasharray: 260.75219025px, 0;
						stroke-dashoffset: -260.75219025px;
					}
				}


            </style>
            <div id="backdrop">
                <div id="alert-container"></div>
            </div>
        `;
        this.animateWindow();
		this.displayAlertWindow();
    }

    /**
     * Renders an Error alert window.
     */
    displayAlertWindow() {
        const alertContainer = this.shadow.querySelector('#alert-container');
        alertContainer.innerHTML = `
            ${!isMobile() ? '<div id="close-button"></div>' : ''}
            <div class="alert-icon">
				${this.icon()}
            </div>
            <h3>${this.message}</h3>
        `;

        // Animation
        anime({
            target: alertContainer.querySelector('.alert-icon'),
            scale: .8
        });
    }

	icon() {
		const okIcon = `
		<div class="ui-success">
			<svg viewBox="0 0 87 87" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
					<g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
							<g id="Group-3" transform="translate(2.000000, 2.000000)">
								<circle id="Oval-2" stroke="rgba(165, 220, 134, 0.2)" stroke-width="4" cx="41.5" cy="41.5" r="41.5"></circle>
									<circle  class="ui-success-circle" id="Oval-2" stroke="#A5DC86" stroke-width="4" cx="41.5" cy="41.5" r="41.5"></circle>
									<polyline class="ui-success-path" id="Path-2" stroke="#A5DC86" stroke-width="4" points="19 38.8036813 31.1020744 54.8046875 63.299221 28"></polyline>
							</g>
					</g>
			</svg>
		</div>`;

		const errorIcon = `
			<div class="ui-error">
				<svg  viewBox="0 0 87 87" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
					<g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
							<g id="Group-2" transform="translate(2.000000, 2.000000)">
								<circle id="Oval-2" stroke="rgba(252, 191, 191, .5)" stroke-width="4" cx="41.5" cy="41.5" r="41.5"></circle>
								<circle  class="ui-error-circle" stroke="#F74444" stroke-width="4" cx="41.5" cy="41.5" r="41.5"></circle>
									<path class="ui-error-line1" d="M22.244224,22 L60.4279902,60.1837662" id="Line" stroke="#F74444" stroke-width="3" stroke-linecap="square"></path>
									<path class="ui-error-line2" d="M60.755776,21 L23.244224,59.8443492" id="Line" stroke="#F74444" stroke-width="3" stroke-linecap="square"></path>
							</g>
					</g>
				</svg>
			</div>`;
		return this.isError === 'true' ? errorIcon : okIcon;


	}

    /**
     * Initial animation for the component.
     */
    animateWindow() {
        const errorContainer = this.shadow.querySelector('#alert-container');
        anime({
            targets: errorContainer,
            scale: [0, 1]
        })
    }

    /**
     * Listen to clicks on this component.
     */
    listenToClick() {
        // Dismiss alert.
        this.shadow.addEventListener('click' , (event) => {
            if (event.target.id === 'close-button' || event.target.id === 'backdrop') {
                this.dismissAlert();
            }
        })
    }

    /**
     * Dismiss the alert window.
     */
    dismissAlert() {
        const errorContainer = this.shadow.querySelector('#alert-container');
        anime({
            targets: errorContainer,
            scale: [1, 0],
			opacity: [1, 0],
            duration: 500,
            complete: () =>{ this.remove() }
        });
    }
}

customElements.define('faa-alert', Alert);
