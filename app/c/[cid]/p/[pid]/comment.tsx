import EditableStatement from './editable-statement'
import Latex from '@/components/latex'
import type { CommentProps } from './types'
// import { canEditComment } from '@/utils/permissions';

export default function Comment({
  comment
}: {
  comment: CommentProps
}) {
  // const canEdit = canEditComment(problem, permission, authors);
  const canEdit = false;
  
  const options = { year: "numeric", month: "short", day: "numeric" };

  return (
    <div className="py-8 px-6 text-base border-t border-slate-200">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center">
          <p className="inline-flex items-center mr-3 text-sm text-slate-900 font-semibold">{/*<img
            className="mr-2 w-6 h-6 rounded-full"
            src="https://flowbite.com/docs/images/people/profile-picture-3.jpg"
            alt="Bonnie Green" />*/}{comment.user.name}</p>
          <p className="text-sm text-slate-600"><time dateTime="2022-03-12"
            title="March 12th, 2022">{comment.createdAt.toLocaleDateString(undefined, options)}</time></p>
        </div>
        {/*
        <button id="dropdownComment3Button" data-dropdown-toggle="dropdownComment3"
            className="inline-flex items-center p-2 text-sm font-medium text-center text-gray-500 bg-white rounded-lg hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-50"
            type="button">
            <svg className="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 3">
                <path d="M2 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm6.041 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM14 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Z"/>
            </svg>
            <span className="sr-only">Comment settings</span>
        </button>
        <div id="dropdownComment3"
            className="hidden z-10 w-36 bg-white rounded divide-y divide-gray-100 shadow">
            <ul className="py-1 text-sm text-gray-700"
                aria-labelledby="dropdownMenuIconHorizontalButton">
                <li>
                    <a href="#"
                        className="block py-2 px-4 hover:bg-gray-100">Edit</a>
                </li>
                <li>
                    <a href="#"
                        className="block py-2 px-4 hover:bg-gray-100">Delete</a>
                </li>
            </ul>
        </div>
        */}
      </div>
      <p className="text-gray-700"><Latex>{`${comment.text}`}</Latex></p>
    </div>
  );

  // if (canEdit) {
  //   return <Latex>{`${comment.text}`}</Latex>;
  // } else {
  //   return <Latex>{`${comment.text}`}</Latex>;
  // }
}
