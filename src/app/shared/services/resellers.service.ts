import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class ResellersService {

    constructor() { }

    getResellers(): any[] {
        return [
            { name: 'Pro Car Dealer' },
            { name: 'Formala Pint Cair' },
            { name: 'Enka Car Care Detailing' },
            { name: 'Gdansk Protection' },
            { name: 'System Pin Caer' },
            { name: 'Car Protection Pin' },
            { name: 'Car Caer System' },
            { name: 'X Protection Pin' },
            { name: 'Pin Car Protection' },
            { name: 'Star Pin Protection' },
            { name: 'Australia' },
            { name: 'Stiyl Car Paint Protection' },
            { name: 'Grand Auto Car Caer' },
            { name: 'Royal Nano Ceramic' },
            { name: 'Az Protection' },
            { name: 'Superior Protection' },
            { name: 'Nanotechnology' },
            { name: 'Perfect Protection' },
            { name: 'Th Protection' },
            { name: 'Car Protection Shield' },
            { name: 'Aston Protect' },
            { name: 'Alfred Protection' },
            { name: 'West Car Protection' },
            { name: 'M.G Car Care' },
            { name: '1 Car Protection' },
            { name: 'Apex Car Protection Germany' },
            { name: 'Elite Auto Shield France' },
            { name: 'Prime Vehicle Protection NL' },
            { name: 'Nordic Car Protection' },
            { name: 'Alpine Auto Shield' },
            { name: 'ProShield Detailing Belgium' },
            { name: 'Vienna Car Protection' },
            { name: 'Prague Auto Protection' },
            { name: 'Aegean Car Shield' },
            { name: 'Bosphorus Car Protection' },
            { name: 'Desert Shield Auto Care' },
            { name: 'Royal Desert Protection' },
            { name: 'Pearl Auto Shield Qatar' },
            { name: 'Atlas Car Protection' }
        ];
    }
}
