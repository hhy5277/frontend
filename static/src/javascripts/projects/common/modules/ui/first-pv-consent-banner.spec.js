// @flow
import {
    firstPvConsentBanner as banner,
    _ as test,
} from './first-pv-consent-banner';

const getAdConsentState: any = require('common/modules/commercial/ad-prefs.lib')
    .getAdConsentState;
const setAdConsentState: any = require('common/modules/commercial/ad-prefs.lib')
    .setAdConsentState;
const Message: any = require('common/modules/ui/message').Message;

beforeEach(() => {
    jest.clearAllMocks();
    Message.mockReset();
    setAdConsentState(0, null);
    setAdConsentState(1, null);
    Message.prototype.show = jest.fn(() => true);
    Message.prototype.hide = jest.fn(() => true);
});

jest.mock('ophan/ng', () => ({
    record: jest.fn(),
}));

jest.mock('common/modules/ui/message', () => ({
    Message: jest.fn(),
}));

jest.mock('common/modules/analytics/google', () => ({
    trackNonClickInteraction: jest.fn(),
}));

jest.mock('common/modules/commercial/ad-prefs.lib', () => {
    const adConsentsState = [null, null];
    return {
        allAdConsents: [0, 1],
        getAdConsentState: jest.fn(a => adConsentsState[a]),
        setAdConsentState: jest.fn((a, b) => {
            adConsentsState[a] = b;
        }),
    };
});

describe('First PV consents banner', () => {
    it('should show up with null consents', () =>
        banner.canShow().then(showable => {
            expect(showable).toBe(true);
        }));
    it('should not show with set consents', () => {
        setAdConsentState(0, true);
        setAdConsentState(1, false);
        return banner.canShow().then(showable => {
            expect(showable).toBe(false);
        });
    });
    it('should show a message', () => {
        banner.show();
        expect(Message.prototype.show).toHaveBeenCalled();
    });
    it('should contain an agree button', () => {
        banner.show();
        expect(Message.prototype.show.mock.calls[0][0]).toMatch(
            test.bindableClassNames.agree
        );
    });
    describe('After agreeing', () => {
        it('should set all consents as true on agree', () => {
            test.onAgree(Message.prototype);
            expect(getAdConsentState(0)).toBe(true);
            expect(getAdConsentState(1)).toBe(true);
        });
        it('should hide the banner on agree', () => {
            test.onAgree(Message.prototype);
            expect(Message.prototype.hide).toHaveBeenCalled();
        });
    });
});