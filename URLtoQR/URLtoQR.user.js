// ==UserScript==
// @name         URLtoQR
// @namespace    https://github.com/JokohamaDev/userscripts
// @version      1.0
// @description  Adds a button to generate the QR code of the opening URL
// @author       Jokohama
// @match        *://*/*
// @grant        GM_addStyle
// @require      https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js
// ==/UserScript==

(function() {
    'use strict';

    // Add the QR button to the page
    const qrButton = document.createElement('button');
    qrButton.textContent = 'QR';
    qrButton.classList.add('qr-code-button');
    qrButton.addEventListener('click', showQrCode);
    document.body.appendChild(qrButton);

    // Add the CSS styles for the QR code lightbox
    GM_addStyle(`
        .qr-code-button {
            position: fixed;
            top: 8px;
            right: 8px;
            z-index: 9999;
        }
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
        }
        .qr-code-content {
            background-color: white;
            padding: 24px;
            border-radius: 8px;
            text-align: center;
        }
        .qr-code-close {
            color: white;
            position: absolute;
            top: 0px;
            right: 16px;
            font-size: 32px;
            cursor: pointer;
        }
    `);

    // Function to show the QR code lightbox
    function showQrCode() {
        const qrCodeContainer = document.createElement('div');
        qrCodeContainer.classList.add('qr-code-lightbox');

        const qrCodeContent = document.createElement('div');
        qrCodeContent.classList.add('qr-code-content');

        const qrCodeCloseButton = document.createElement('span');
        qrCodeCloseButton.classList.add('qr-code-close');
        qrCodeCloseButton.textContent = '×';
        qrCodeCloseButton.addEventListener('click', () => {
            qrCodeContainer.remove();
        });

        const qrCodeImage = document.createElement('div');
        qrCodeImage.id = 'qr-code-image';

        qrCodeContent.appendChild(qrCodeCloseButton);
        qrCodeContent.appendChild(qrCodeImage);
        qrCodeContainer.appendChild(qrCodeContent);
        document.body.appendChild(qrCodeContainer);

        // Add click event listener to the lightbox
        qrCodeContainer.addEventListener('click', (event) => {
            if (event.target === qrCodeContainer) {
                qrCodeContainer.remove();
            }
        });

        // Generate the QR code
        const qrCode = qrcode(0, 'L');
        qrCode.addData(window.location.href);
        qrCode.make();
        document.getElementById('qr-code-image').innerHTML = qrCode.createImgTag(6);
    }
})();
