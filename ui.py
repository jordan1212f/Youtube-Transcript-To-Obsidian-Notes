import sys
import time
import threading

# ANSI colour codes
PURPLE = '\033[35m'
RED = '\033[31m'
GREEN = '\033[32m'
RESET = '\033[0m'

SPINNER_FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']

class Spinner:

    def __init__(self, message, colour = PURPLE):
        self.message = message
        self.colour = colour
        self.running = False
        self.thread = None

    def _spin(self):

        """Background thread that draws the spinner frames.
 
        \r moves the cursor back to the start of the line
        so each frame overwrites the previous one.
        end='' prevents print from adding a newline.
        flush=True forces the output to appear immediately
        (without it, Python might buffer the output).
        """

        i = 0
        while self.running:
            frame = SPINNER_FRAMES[i % len(SPINNER_FRAMES)]
            print(
                f'\r{self.colour}{frame}{RESET} {self.message}',
                end='',
                flush=True
            )
            time.sleep(0.08)
            i += 1
    
    def start(self):
        self.running = True
        self.thread = threading.Thread(target=self._spin, daemon=True)
        self.thread.start()

    def stop(self, final_message=None, success=True):
        self.running = False
        if self.thread:
            self.thread.join()

        icon = f'{GREEN}✅{RESET}' if success else f'{RED}❌{RESET}'
        msg = final_message or self.message
        print(f'\r\033[K{icon} {msg}')

    def __enter__(self):
        self.start()
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type:
            self.stop(success=False)
        else:
            self.stop()
        return False
 
def print_banner():
    """Print a coloured banner when the tool starts."""
    banner = f"""
{PURPLE}╔═══════════════════════════════════╗
║           {RED}▶{PURPLE}  Obsiditube             ║
║   {RESET}YouTube To Obsidian Notes{PURPLE}       ║
╚═══════════════════════════════════╝{RESET}
"""
    print(banner)