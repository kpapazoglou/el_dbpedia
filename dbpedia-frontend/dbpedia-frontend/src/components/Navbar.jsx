const Navbar = () => {
    return (
      <nav className="bg-blue-600 text-white p-4 shadow">
        <div className="container flex justify-between items-center">
          <h1 className="text-xl font-semibold">DBpedia SPARQL Explorer</h1>
          <a href="https://github.com/dbpedia" target="_blank" className="text-sm hover:underline">
            GitHub Repo
          </a>
        </div>
      </nav>
    );
  };
  
  export default Navbar;