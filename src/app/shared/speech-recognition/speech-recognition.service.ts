import { Injectable } from "@angular/core";
import { Observable } from 'rxjs/Observable';

import { Platform } from 'ionic-angular';
import { SpeechRecognition } from '@ionic-native/speech-recognition';

@Injectable()

export class SpeechRecognitionService
{
    constructor(private platform : Platform, private speechRecognition: SpeechRecognition) {}

    checkAccess() : Promise<Boolean>
    {
        return new Promise((resolve, reject) => {
            if (this.platform.is('cordova'))
            {
                this.speechRecognition.isRecognitionAvailable()
                    .then((available: boolean) => {
                        if (available)
                        {
                            this.speechRecognition.hasPermission()
                                .then((hasPermission: boolean) => { 
                                    if (hasPermission){
                                        resolve(true);
                                    }
                                    else {
                                        this.speechRecognition.requestPermission()
                                            .then(
                                                () => resolve(true),
                                                () => resolve(false)
                                            );
                                    }
                                }, () => resolve(false));
                        }
                        else
                        {
                            resolve(false);
                        }
                }, () => resolve(false));
            }
            else 
            {
                resolve(false);
            }
        });
    }

    startListening(message : string = null) : Observable<string[]>
    {
        let options = {};
        
        if(message)
            options = {prompt: message};

        return this.speechRecognition.startListening(options);
    }
}