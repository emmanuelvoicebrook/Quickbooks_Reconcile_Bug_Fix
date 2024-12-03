import { LightningElement, track, wire } from 'lwc';
import getAccountFilesInLibrary from '@salesforce/apex/AccountLibraryFilesController.getAccountFilesInLibrary';
import getAccountFilesInLibrary2 from '@salesforce/apex/AccountLibraryFilesFetcher.getAccountFilesInLibrary';
import { NavigationMixin } from 'lightning/navigation';

export default class AccountLibraryFiles extends NavigationMixin(LightningElement) {
    @track files = [];
    @track error;
    libraryId = '058V100000076lRIAQ'; // Replace with your library ID

    // @wire(getAccountFilesInLibrary, { libraryId: '$libraryId' })
    // wiredFiles({ error, data }) {
    //     if (data) {
    //         console.log('data', data);
    //         this.files = data.map(file => {
    //             console.log('file', file);
    //             return {
    //                 ...file,
    //                 downloadUrl: '/sfsites/c' + file.DownloadUrl,
    //                 previewUrl: file.PreviewUrl ? '/sfsites/c' + file.PreviewUrl : null
    //             };
    //         });
    //         this.error = undefined;
    //     } else if (error) {
    //         console.error('error', error);
    //         this.error = error;
    //         this.files = [];
    //     }
    // }

    // parse account id : 0010h00001ZXNMzAAP
    @wire(getAccountFilesInLibrary2, { accountId : '0010h00001ZXNMzAAP' })
    wiredFiles2({ error, data }) {
        if (data) {
            console.log('data', data);
            this.files = data.map(file => {
                console.log('file', file);
                return {
                    ...file,
                    downloadUrl: '/sfsites/c' + file.DownloadUrl,
                    previewUrl: file.PreviewUrl ? '/sfsites/c' + file.PreviewUrl : null
                };
            });
            this.error = undefined;
        } else if (error) {
            console.error('error', error);
            this.error = error;
            this.files = [];
        }
    }


    handlePreview(event) {
        const url = event.currentTarget.dataset.url;
        window.open(url, '_blank');
    }

    handleDownload(event) {
        const url = event.currentTarget.dataset.url;
        window.open(url, '_blank');
    }

    get hasFiles() {
        return this.files.length > 0;
    }

    get showFiles() {
        return this.files.length > 0 && !this.error;
    }
}