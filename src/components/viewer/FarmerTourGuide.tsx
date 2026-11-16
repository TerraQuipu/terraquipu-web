'use client';

import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { createFarmerTour, DecisionStepType } from '@/lib/farmerTour';

export interface FarmerTourGuideRef {
  startTour: () => void;
}

interface FarmerTourGuideProps {
  onSetDecisionStep?: (step: DecisionStepType) => void;
  onShowToast?: (msg: string) => void;
}

const FarmerTourGuide = forwardRef<FarmerTourGuideRef, FarmerTourGuideProps>(
  ({ onSetDecisionStep, onShowToast }, ref) => {
    const driverInstanceRef = useRef<any>(null);

    const startTour = () => {
      // Ensure any previous driver is destroyed before re-starting
      if (driverInstanceRef.current) {
        try {
          driverInstanceRef.current.destroy();
        } catch {
          // ignore
        }
      }

      const tour = createFarmerTour({
        onSetDecisionStep,
        onComplete: () => {
          if (onShowToast) {
            onShowToast('Walkthrough completed: You are now equipped to model and optimize your parcel!');
          }
        },
      });

      driverInstanceRef.current = tour;
      tour.drive();
    };

    useImperativeHandle(ref, () => ({
      startTour,
    }));

    // Auto-start on first visit with localStorage check
    useEffect(() => {
      if (typeof window === 'undefined') return;

      const hasSeenTour = localStorage.getItem('terraquipu_farmer_tour_seen');
      if (!hasSeenTour) {
        // Wait slightly for Leaflet map & components to settle into DOM
        const timer = setTimeout(() => {
          startTour();
        }, 1200);

        return () => clearTimeout(timer);
      }
    }, []);

    return null;
  }
);

FarmerTourGuide.displayName = 'FarmerTourGuide';

export default FarmerTourGuide;
