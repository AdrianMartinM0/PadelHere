import os

def generate():
    template = """
    <html>
    <head><script src="https://cdn.tailwindcss.com"></script></head>
    <body class="bg-gray-100 p-8">
        <h1 class="text-3xl font-bold mb-4">PadelHere Project Board</h1>
        <p class="mb-4">Estado derivado de artefactos BMad.</p>
        <div class="grid grid-cols-3 gap-4">
            <div class="bg-white p-4 rounded shadow border-t-4 border-blue-500">
                <h2 class="font-bold">NOW</h2>
                <ul class="text-sm"><li>Infraestructura Base</li></ul>
            </div>
            <div class="bg-white p-4 rounded shadow border-t-4 border-yellow-500">
                <h2 class="font-bold">NEXT</h2>
                <ul class="text-sm"><li>Tests/CI Automático</li></ul>
            </div>
            <div class="bg-white p-4 rounded shadow border-t-4 border-gray-500">
                <h2 class="font-bold">FUTURE</h2>
                <ul class="text-sm"><li>Funcionalidades de Negocio</li></ul>
            </div>
        </div>
    </body>
    </html>
    """
    os.makedirs('_bmad/dashboard', exist_ok=True)
    with open('_bmad/dashboard/index.html', 'w') as f:
        f.write(template)

if __name__ == "__main__":
    generate()
