import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Tabs,
  Tab,
  Chip,
  Dialog,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { HierarchicalItem, FinancialNote } from './types'; // Assuming FinancialNote is exported from types

interface SchedulesDashboardProps {
  // We need the full notes array to get the correct titles
  allNotes: FinancialNote[]; 
  data: HierarchicalItem[];
  onClose: () => void;
  open: boolean;
}

interface NoteStatus {
  noteNumber: string | number;
  // This is now the official title from the notes definition
  title: string; 
  status: 'edited' | 'not_edited' | 'editable';
}

const SchedulesDashboard: React.FC<SchedulesDashboardProps> = ({ allNotes, data, onClose, open }) => {
  const [tabValue, setTabValue] = useState(0);
  const [notesStatus, setNotesStatus] = useState<NoteStatus[]>([]);

   useEffect(() => {
    const extractUniqueNotesStatus = (): NoteStatus[] => {
      if (!allNotes || allNotes.length === 0) {
        return [];
      }

      // Step 1: Create a map for each unique note number (3, 4, 5, etc.)
      const statusMap = new Map<string, NoteStatus>();

      for (const note of allNotes) {
        const rootNoteNumber = String(note.noteNumber).match(/^\d+/)?.[0];
        if (rootNoteNumber && !statusMap.has(rootNoteNumber)) {
          statusMap.set(rootNoteNumber, {
            noteNumber: rootNoteNumber,
            title: note.title, // Use the main title
            status: 'not_edited', // Default status
          });
        }
      }
      
      // Step 2: Iterate through the financial data to update the status
      const processItem = (item: HierarchicalItem) => {
        if (item.note) {
          const rootNoteNumber = String(item.note).match(/^\d+/)?.[0];
          
          if (rootNoteNumber) {
            const masterNote = statusMap.get(rootNoteNumber);

            if (masterNote) {
              // Any editable sub-note makes the main note 'editable'
              if (item.isEditableNote && masterNote.status !== 'edited') {
                masterNote.status = 'editable';
              }
              
              // Any edited sub-note makes the main note 'edited' (highest priority)
              if (item.isEdited) {
                masterNote.status = 'edited';
              }
            }
          }
        }
        
        if (item.children) {
          item.children.forEach(processItem);
        }
      };

      data.forEach(processItem);
      
      return Array.from(statusMap.values());
    };
    
    if (open) {
      setNotesStatus(extractUniqueNotesStatus());
    }
  }, [data, allNotes, open]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  const editableCount = notesStatus.filter(note => note.status === 'editable').length;
  const editedCount = notesStatus.filter(note => note.status === 'edited').length;
  const notEditedCount = notesStatus.filter(note => note.status === 'not_edited').length;
  const allCount = notesStatus.length;

  const filteredNotes = () => {
    switch (tabValue) {
      case 0: // All notes
        return notesStatus;
      case 1: // Editable notes (that are NOT yet edited)
        return notesStatus.filter(note => note.status === 'editable');
      case 2: // Edited notes
        return notesStatus.filter(note => note.status === 'edited');
      case 3: // Not Editable notes
        return notesStatus.filter(note => note.status === 'not_edited');
      default:
        return notesStatus;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'editable':
        return 'primary';
      case 'edited':
        return 'success';
      case 'not_edited':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'editable':
        return 'Editable';
      case 'edited':
        return 'Edited';
      case 'not_edited':
        return 'Not Editable';
      default:
        return status;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <Paper sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5">Schedules Dashboard</Typography>
          <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
        </Box>
      
        <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 2 }}>
            <Tab label={`All Notes (${allCount})`} />
            <Tab label={`Editable (${editableCount})`} />
            <Tab label={`Edited (${editedCount})`} />
            <Tab label={`Not Editable (${notEditedCount})`} />
        </Tabs>
      
        <TableContainer>
            <Table>
            <TableHead>
                <TableRow>
                <TableCell>Note Number</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Status</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {filteredNotes().map((note) => (
                <TableRow key={note.noteNumber}>
                    <TableCell>{note.noteNumber}</TableCell>
                    <TableCell>{note.title}</TableCell>
                    <TableCell>
                    <Chip 
                        label={getStatusLabel(note.status)} 
                        color={getStatusColor(note.status) as any}
                        size="small"
                    />
                    </TableCell>
                </TableRow>
                ))}
                {filteredNotes().length === 0 && (
                <TableRow><TableCell colSpan={3} align="center">No notes found in this category</TableCell></TableRow>
                )}
            </TableBody>
            </Table>
        </TableContainer>
      </Paper>
    </Dialog>
  );
};

export default SchedulesDashboard;