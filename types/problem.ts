interface Problem {
    _id: string;
    collection: string;
    pid: string;
    title: string;
    statement: string;
    // submitter: string;
    authors: {
      author_id: string;
      // display_name?: string;
      // is_anonymous: boolean;
    }[];
    answer: string;
    solutions: {
      text: string;
      // summary?: string;
      authors: {
        author_id: string;
        name: string; // name comes from a separate query though, to reduce duplication
        // display_name?: string;
        // is_anonymous: boolean;
      }[];
    }[];
    subject: "Algebra" | "Combinatorics" | "Geometry" | "Number Theory";
    // likes: number;
    // difficulty: number;
    // source?: string;
  }
  
  export default Problem;