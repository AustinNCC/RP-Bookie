import { Event, EventSelection, OddsConfig } from '../types';
import Decimal from 'decimal.js';

const DEFAULT_CONFIG: OddsConfig = {
  volumeThreshold: 1000, // $1000 in bets triggers adjustment
  maxAdjustment: 20, // Maximum 20% adjustment
  adjustmentInterval: 300000, // 5 minutes between adjustments
  houseEdge: 5, // 5% target house edge
};

/**
 * Calculate new odds based on betting volume and risk
 */
export const calculateDynamicOdds = (
  event: Event,
  selection: EventSelection,
  config: OddsConfig = DEFAULT_CONFIG
): number => {
  const now = new Date();
  const timeSinceUpdate = now.getTime() - event.lastOddsUpdate.getTime();
  
  // Don't update if within adjustment interval
  if (timeSinceUpdate < config.adjustmentInterval) {
    return selection.odds;
  }
  
  // Calculate volume-based adjustment
  const volumeRatio = selection.volume / event.totalWagered;
  const volumeAdjustment = volumeRatio > 0.5 
    ? (volumeRatio - 0.5) * config.maxAdjustment 
    : 0;
  
  // Calculate risk-based adjustment
  const potentialLiability = new Decimal(selection.volume)
    .times(selection.odds)
    .minus(selection.volume)
    .toNumber();
    
  const riskRatio = potentialLiability / event.totalWagered;
  const riskAdjustment = riskRatio > 0.3 
    ? (riskRatio - 0.3) * config.maxAdjustment 
    : 0;
  
  // Apply adjustments
  const totalAdjustment = Math.min(
    volumeAdjustment + riskAdjustment,
    config.maxAdjustment
  );
  
  const adjustmentFactor = 1 - (totalAdjustment / 100);
  const newOdds = new Decimal(selection.initialOdds)
    .times(adjustmentFactor)
    .toDecimalPlaces(2)
    .toNumber();
  
  // Ensure odds don't go below minimum profitable value
  const minOdds = 1 + (config.houseEdge / 100);
  return Math.max(newOdds, minOdds);
};

/**
 * Update odds for all selections in an event
 */
export const updateEventOdds = (event: Event): Event => {
  const updatedSelections = event.selections.map(selection => ({
    ...selection,
    odds: calculateDynamicOdds(event, selection)
  }));
  
  return {
    ...event,
    selections: updatedSelections,
    lastOddsUpdate: new Date()
  };
};

/**
 * Calculate implied probability from odds
 */
export const calculateImpliedProbability = (odds: number): number => {
  return new Decimal(1).dividedBy(odds).times(100).toNumber();
};

/**
 * Format odds for display
 */
export const formatOdds = (odds: number): string => {
  return new Decimal(odds).toFixed(2);
};