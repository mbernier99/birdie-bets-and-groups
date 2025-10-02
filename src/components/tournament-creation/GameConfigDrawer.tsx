import React from 'react';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface GameConfig {
  [key: string]: any;
}

interface ConfigField {
  key: string;
  label: string;
  type: 'number' | 'toggle' | 'select';
  defaultValue: any;
  options?: { value: any; label: string }[];
  min?: number;
  max?: number;
  step?: number;
}

interface GameConfigDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  gameName: string;
  config: GameConfig;
  onSave: (config: GameConfig) => void;
  fields: ConfigField[];
}

const GameConfigDrawer: React.FC<GameConfigDrawerProps> = ({
  isOpen,
  onClose,
  gameName,
  config,
  onSave,
  fields,
}) => {
  const [localConfig, setLocalConfig] = React.useState<GameConfig>(config);

  React.useEffect(() => {
    setLocalConfig(config);
  }, [config, isOpen]);

  const handleSave = () => {
    onSave(localConfig);
    onClose();
  };

  const updateField = (key: string, value: any) => {
    setLocalConfig((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{gameName} Settings</DrawerTitle>
        </DrawerHeader>

        <div className="px-4 py-6 space-y-6 max-h-[60vh] overflow-y-auto">
          {fields.map((field) => (
            <div key={field.key} className="space-y-2">
              <Label htmlFor={field.key}>{field.label}</Label>
              
              {field.type === 'number' && (
                <Input
                  id={field.key}
                  type="number"
                  value={localConfig[field.key] ?? field.defaultValue}
                  onChange={(e) => updateField(field.key, Number(e.target.value))}
                  min={field.min}
                  max={field.max}
                  step={field.step}
                  className="h-12 text-lg"
                />
              )}

              {field.type === 'toggle' && (
                <div className="flex items-center justify-between h-12 px-4 rounded-lg border">
                  <span className="text-sm">{field.label}</span>
                  <Switch
                    checked={localConfig[field.key] ?? field.defaultValue}
                    onCheckedChange={(checked) => updateField(field.key, checked)}
                  />
                </div>
              )}

              {field.type === 'select' && field.options && (
                <div className="grid grid-cols-2 gap-2">
                  {field.options.map((option) => (
                    <Button
                      key={option.value}
                      variant={localConfig[field.key] === option.value ? 'default' : 'outline'}
                      onClick={() => updateField(field.key, option.value)}
                      className="h-12"
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <DrawerFooter>
          <Button onClick={handleSave} size="lg" className="w-full">
            Save Settings
          </Button>
          <DrawerClose asChild>
            <Button variant="outline" size="lg" className="w-full">
              Cancel
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default GameConfigDrawer;
