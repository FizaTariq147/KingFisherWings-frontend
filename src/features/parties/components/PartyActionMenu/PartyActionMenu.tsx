import { Eye, Pencil, Power, PowerOff, ShieldAlert, Trash2 } from 'lucide-react';
import { KebabMenu, MenuItem } from '@/components/ui/KebabMenu';
import type { Party } from '../../types/party.types';

interface PartyActionMenuProps {
  party: Party;
  disabled?: boolean;
  onView: (party: Party) => void;
  onEdit: (party: Party) => void;
  onActivate: (party: Party) => void;
  onDeactivate: (party: Party) => void;
  onCreditStatus: (party: Party) => void;
  onDelete: (party: Party) => void;
}

export function PartyActionMenu({
  party,
  disabled,
  onView,
  onEdit,
  onActivate,
  onDeactivate,
  onCreditStatus,
  onDelete,
}: PartyActionMenuProps) {
  const isActive = party.is_active !== false;

  return (
    <KebabMenu disabled={disabled} menuClassName="w-52" aria-label="Party actions">
      {(close) => (
        <>
          <MenuItem
            label="View details"
            icon={<Eye className="h-3.5 w-3.5" />}
            onClick={() => {
              close();
              onView(party);
            }}
          />
          <MenuItem
            label="Edit"
            icon={<Pencil className="h-3.5 w-3.5" />}
            onClick={() => {
              close();
              onEdit(party);
            }}
          />
          {isActive ? (
            <MenuItem
              label="Deactivate"
              icon={<PowerOff className="h-3.5 w-3.5" />}
              onClick={() => {
                close();
                onDeactivate(party);
              }}
            />
          ) : (
            <MenuItem
              label="Activate"
              icon={<Power className="h-3.5 w-3.5" />}
              onClick={() => {
                close();
                onActivate(party);
              }}
            />
          )}
          <MenuItem
            label="Credit status"
            icon={<ShieldAlert className="h-3.5 w-3.5" />}
            onClick={() => {
              close();
              onCreditStatus(party);
            }}
          />
          <MenuItem
            label="Delete"
            icon={<Trash2 className="h-3.5 w-3.5" />}
            danger
            onClick={() => {
              close();
              onDelete(party);
            }}
          />
        </>
      )}
    </KebabMenu>
  );
}
