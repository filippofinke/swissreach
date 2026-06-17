/**
 * First-launch guided tour, built on driver.js.
 *
 * `startTour()` opens the tour on demand (the status-bar "?" button).
 * `maybeAutoStart()` opens it once per browser, gated by a localStorage flag
 * mirroring the `isochrone_lang` convention. Finishing OR closing the tour both
 * set the flag, so the user is never nagged twice.
 */
import 'driver.js/dist/driver.css';
import { type Driver, driver } from 'driver.js';
import { useCallback, useRef } from 'react';
import { useTranslation } from '../i18n/I18nProvider';
import { buildTourSteps } from './steps';

const SEEN_KEY = 'isochrone_tour_seen';

export function useTour(onStart?: () => void) {
  const { t } = useTranslation();
  // Keep the latest dictionary without re-creating the callbacks; the tour is
  // always built from the language active at the moment it is opened.
  const tRef = useRef(t);
  tRef.current = t;
  const onStartRef = useRef(onStart);
  onStartRef.current = onStart;
  const driverRef = useRef<Driver | null>(null);

  const startTour = useCallback(() => {
    // Let the host prepare the UI first (e.g. expand a collapsed sidebar so the
    // sidebar steps have visible targets).
    onStartRef.current?.();

    const tour = tRef.current.tour;
    const instance = driver({
      showProgress: true,
      progressText: tour.progress,
      nextBtnText: tour.next,
      prevBtnText: tour.back,
      doneBtnText: tour.done,
      overlayColor: '#000000',
      overlayOpacity: 0.55,
      stagePadding: 6,
      stageRadius: 8,
      popoverClass: 'sr-tour',
      allowClose: true,
      steps: buildTourSteps(tour),
      onDestroyed: () => {
        try {
          localStorage.setItem(SEEN_KEY, '1');
        } catch {
          // Private mode / storage disabled — tour simply reappears next visit.
        }
      },
    });
    driverRef.current = instance;
    instance.drive();
  }, []);

  const maybeAutoStart = useCallback(() => {
    let seen = false;
    try {
      seen = localStorage.getItem(SEEN_KEY) === '1';
    } catch {
      seen = false;
    }
    if (!seen) startTour();
  }, [startTour]);

  return { startTour, maybeAutoStart };
}
