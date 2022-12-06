export default function Sidebar() {
  return (
    <div class="flex flex-col w-64 h-screen px-4 py-8 bg-white">
      <h2 class="text-3xl font-semibold text-center text-slate-800">Probase</h2>
      
      <div class="flex flex-col justify-between flex-1 mt-6">
        <nav>
          <a class="flex items-center px-4 py-2 my-4 text-slate-600 transition-colors duration-300 rounded-lg hover:bg-slate-100 hover:text-slate-700" href="#">
            <span class="mx-4 font-medium">Home</span>
          </a>

          <a class="flex items-center px-4 py-2 my-4 text-slate-700 bg-slate-100 rounded-lg" href="#">
            <span class="mx-4 font-medium">CMIMC</span>
          </a>

          <a class="flex items-center px-4 py-2 my-4 text-slate-600 transition-colors duration-300 rounded-lg hover:bg-slate-100 hover:text-slate-700" href="#">
            <span class="mx-4 font-medium">HMMT</span>
          </a>
        </nav>
      </div>
    </div>
  );
}
