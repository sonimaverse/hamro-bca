import React from 'react';
import { Resources } from './Resources.js';

export const Notes: React.FC<{ navigate: (path: string) => void }> = ({ navigate }) => {
  return <Resources navigate={navigate} presetType="Notes" />;
};
