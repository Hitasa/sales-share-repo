import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";

interface Note {
  content: string;
  created_at: string;
}

interface ProjectNotesProps {
  notes: Note[];
  onAddNote: (content: string) => void;
}

export const ProjectNotes = ({ notes, onAddNote }: ProjectNotesProps) => {
  const [newNote, setNewNote] = useState("");

  const handleAddNote = () => {
    if (newNote.trim()) {
      onAddNote(newNote);
      setNewNote("");
    }
  };

  return (
    <Card className="p-4">
      <h4 className="text-sm font-medium mb-4">Notes</h4>
      <div className="space-y-4">
        <div className="flex gap-2">
          <Textarea
            placeholder="Add a new note..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            className="min-h-[100px]"
          />
          <Button onClick={handleAddNote} className="self-end">
            Add Note
          </Button>
        </div>
        
        <ScrollArea className="h-[300px] w-full mt-4">
          <div className="space-y-4">
            {notes?.map((note, index) => (
              <Card key={index} className="p-4">
                <p className="text-sm text-gray-600 mb-2">
                  {format(new Date(note.created_at), "PPp")}
                </p>
                <p className="text-gray-900">{note.content}</p>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>
    </Card>
  );
};