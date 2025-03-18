// ==UserScript==
// @name         URLtoQR
// @namespace    https://github.com/JokohamaDev/userscripts
// @version      1.1
// @description  Adds a button to generate the QR code of the opening URL
// @author       Jokohama
// @match        *://*/*
// @grant        GM_addStyle
// @grant        GM_registerMenuCommand
// @require      https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js
// ==/UserScript==

(function() {
    'use strict';

    try {
        // Add the CSS styles for the QR code elements
        try {
            GM_addStyle(`
                /* Floating button styles */
                .qr-code-button {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background-color: rgba(0, 0, 0, 0.6);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    font-size: 14px;
                    z-index: 9999;
                    border: none;
                    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
                    transition: opacity 0.3s, transform 0.3s;
                    opacity: 0.7;
                }
                .qr-code-button:hover {
                    opacity: 1;
                    color: green;
                    transform: scale(1.1);
                }
                .qr-code-button.hidden {
                    opacity: 0;
                    pointer-events: none;
                }
                
                /* QR code lightbox */
                .qr-code-lightbox {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(0, 0, 0, 0.8);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 9999;
                    opacity: 0;
                    transition: opacity 0.3s;
                }
                .qr-code-lightbox.visible {
                    opacity: 1;
                }
                .qr-code-content {
                    background-color: white;
                    padding: 24px;
                    border-radius: 8px;
                    text-align: center;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
                    max-width: 90%;
                    position: relative;
                }
                .qr-code-close {
                    color: white;
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background-color: rgba(0, 0, 0, 0.6);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    font-size: 24px;
                    z-index: 9999;
                    border: none;
                    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
                    transition: opacity 0.3s, transform 0.3s;
                }
                .qr-code-close:hover {
                    opacity: 1;
                    transform: scale(1.05);
                }
                .qr-code-error {
                    color: red;
                    margin-top: 10px;
                    font-weight: bold;
                }
                .qr-code-url {
                    margin-top: 16px;
                    font-size: 12px;
                    color: #666;
                    word-break: break-all;
                    max-width: 300px;
                    margin-left: auto;
                    margin-right: auto;
                }
            `);
        } catch (styleError) {
            console.error('Failed to add styles:', styleError);
        }

        // Register context menu command (if supported by userscript manager)
        if (typeof GM_registerMenuCommand === 'function') {
            GM_registerMenuCommand('Generate QR Code for current page', showQrCode);
        }

        // Create floating button (can be toggled on/off)
        const qrButton = document.createElement('button');
        qrButton.textContent = 'QR';
        qrButton.classList.add('qr-code-button');
        qrButton.setAttribute('aria-label', 'Generate QR Code for current page');
        
        try {
            qrButton.addEventListener('click', showQrCode);
        } catch (eventError) {
            console.error('Failed to add event listeners to QR button:', eventError);
        }
        
        // Safely append button to document body
        if (document.body) {
            document.body.appendChild(qrButton);
        } else {
            console.error('Document body not available for appending QR button');
            // Wait for DOM to be ready
            document.addEventListener('DOMContentLoaded', function() {
                if (document.body) {
                    document.body.appendChild(qrButton);
                }
            });
        }
    } catch (initError) {
        console.error('Error during initialization:', initError);
    }

    // Function to show the QR code lightbox
    function showQrCode() {
        try {
            // Validate URL before attempting to generate QR code
            const currentUrl = window.location.href;
            if (!currentUrl) {
                throw new Error('No URL available to generate QR code');
            }
            
            // Create container elements
            const qrCodeContainer = document.createElement('div');
            qrCodeContainer.classList.add('qr-code-lightbox');

            const qrCodeContent = document.createElement('div');
            qrCodeContent.classList.add('qr-code-content');

            const qrCodeCloseButton = document.createElement('span');
            qrCodeCloseButton.classList.add('qr-code-close');
            qrCodeCloseButton.textContent = '×';
            qrCodeCloseButton.setAttribute('aria-label', 'Close QR Code');
            
            try {
                qrCodeCloseButton.addEventListener('click', () => {
                    try {
                        closeQrCode(qrCodeContainer);
                    } catch (removeError) {
                        console.error('Failed to remove QR code container:', removeError);
                    }
                });
            } catch (eventError) {
                console.error('Failed to add click event listener to close button:', eventError);
            }

            const qrCodeImage = document.createElement('div');
            qrCodeImage.id = 'qr-code-image';

            const qrCodeUrl = document.createElement('div');
            qrCodeUrl.classList.add('qr-code-url');
            qrCodeUrl.textContent = currentUrl;

            qrCodeContent.appendChild(qrCodeCloseButton);
            qrCodeContent.appendChild(qrCodeImage);
            qrCodeContent.appendChild(qrCodeUrl);
            qrCodeContainer.appendChild(qrCodeContent);
            
            // Safely append to document body
            if (document.body) {
                document.body.appendChild(qrCodeContainer);
                
                // Add animation effect - show after a small delay
                setTimeout(() => {
                    qrCodeContainer.classList.add('visible');
                }, 10);
            } else {
                throw new Error('Document body not available for appending QR code container');
            }

            // Add click event listener to the lightbox
            try {
                qrCodeContainer.addEventListener('click', (event) => {
                    if (event.target === qrCodeContainer) {
                        try {
                            closeQrCode(qrCodeContainer);
                        } catch (removeError) {
                            console.error('Failed to remove QR code container:', removeError);
                        }
                    }
                });
                
                // Add keyboard escape key support
                document.addEventListener('keydown', function escKeyHandler(e) {
                    if (e.key === 'Escape') {
                        closeQrCode(qrCodeContainer);
                        document.removeEventListener('keydown', escKeyHandler);
                    }
                });
            } catch (eventError) {
                console.error('Failed to add click event listener to container:', eventError);
            }

            // Generate the QR code
            try {
                if (typeof qrcode !== 'function') {
                    throw new Error('QR code library not loaded properly');
                }
                
                // Check if URL is too long (QR code has data capacity limits)
                if (currentUrl.length > 2000) {
                    throw new Error('URL is too long to generate a reliable QR code');
                }
                
                const qrCode = qrcode(0, 'L');
                qrCode.addData(currentUrl);
                qrCode.make();
                
                const qrCodeElement = document.getElementById('qr-code-image');
                if (qrCodeElement) {
                    qrCodeElement.innerHTML = qrCode.createImgTag(6);
                } else {
                    throw new Error('QR code image element not found');
                }
            } catch (qrError) {
                console.error('Failed to generate QR code:', qrError);
                
                // Display error message to user
                const errorMessage = document.createElement('div');
                errorMessage.classList.add('qr-code-error');
                errorMessage.textContent = `Error: ${qrError.message || 'Failed to generate QR code'}`;
                
                const qrCodeElement = document.getElementById('qr-code-image');
                if (qrCodeElement) {
                    qrCodeElement.appendChild(errorMessage);
                }
            }
        } catch (error) {
            console.error('Error in showQrCode function:', error);
            alert(`Failed to generate QR code: ${error.message}`);
        }
    }
    
    // Function to close QR code with animation
    function closeQrCode(container) {
        container.classList.remove('visible');
        setTimeout(() => {
            container.remove();
        }, 300); // Match transition duration
    }
})();
