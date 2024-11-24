import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { Company, Comment } from "@/services/types";

interface CompanyCommentsSectionProps {
  editedCompany: Company;
  newComment: string;
  setNewComment: (comment: string) => void;
  onAddComment: () => void;
}

export const CompanyCommentsSection = ({
  editedCompany,
  newComment,
  setNewComment,
  onAddComment,
}: CompanyCommentsSectionProps) => {
  return (
    <div className="pt-4 border-t">
      <h3 className="text-lg font-semibold mb-2">About</h3>
      <p className="text-gray-600 mb-4">{editedCompany.review}</p>
      
      <div className="space-y-2">
        <h4 className="text-sm font-medium">Comments</h4>
        <Textarea
          placeholder="Add a new comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="min-h-[100px]"
        />
        <Button 
          onClick={onAddComment}
          className="w-full"
        >
          Add Comment
        </Button>
      </div>

      <ScrollArea className="h-[200px] w-full">
        <div className="space-y-4">
          {editedCompany.comments?.map((comment: Comment) => (
            <Card key={comment.id} className="p-4">
              <p className="text-sm text-gray-600 mb-2">
                {format(new Date(comment.createdAt), "PPp")}
              </p>
              <p className="text-gray-900">{comment.text}</p>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};