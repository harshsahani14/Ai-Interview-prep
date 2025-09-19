import { use, useEffect,useState } from 'react';
import {Code,Play,RotateCcw,CheckCircle,ArrowLeft } from 'lucide-react';
import CodeMirror, { basicSetup,EditorView } from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { dracula} from '@uiw/codemirror-theme-dracula';
import { java } from '@codemirror/lang-java';
import { python } from '@codemirror/lang-python';

function App() {

  const [ aiReady, setAiReady ] = useState(false);
  const [question, setQuestion] = useState(null);
  const [code,setCode] = useState(`
      function solution() {\n
        console.log("Hello, world!");\n
      }
    `);

    

    const [feedback,setFeedback] = useState("");
    const [loading,setLoading] = useState(false);
    const [solved,setSolved] = useState(false);
    const [difficulty,setDifficulty] = useState("");
    const [warning,setWarning] = useState("");

    useEffect(() => {

      const checkReady = setInterval(() => {
        if (window.puter?.ai?.chat) {
          setAiReady(true);
          clearInterval(checkReady);
        }

      }, 1000);

      return ()=>clearInterval(checkReady);

    }, [aiReady]);

    const handleDifficulty = (level) => {
      setDifficulty(level);
      if(warning) setWarning("");
    }

    const generateQuestion = async () => {

      const validLevels = ["Beginner","Medium","Intermediate"];

      if(!validLevels.includes(difficulty)) {
        setWarning("Please select a difficulty level.");
        return;
      }

      setWarning("");

      setLoading(true);
      setSolved(false);
      setFeedback("");

      setCode(`function solution() {\n
    // Write your code here\n
}
    `);
    setQuestion(null);

    try {
      const res = await window.puter.ai.chat(
        `Generate a random ${difficulty} coding interview question like on LeetCode.Don't generate famous leetcode questions all the time.If the a certain constraint is long, divide it into two parts. Respond only in valid JSON with this structure:
        {
        "problem":"string",
        example:"string",
        "constraints":"string",
        "note":"string"
      }
      `
      )

      const reply = typeof res === "string" ? 
      res  : res.message?.content || "";

      const parsed = JSON.parse(reply);

      setQuestion(parsed);


    } catch (error) {
      setFeedback("Error generating question. Please try again.",error.message);
    }
    finally {
      setLoading(false);
    }


    }
      
    const checkSolution = async () => {
      
      if(!code.trim()) {
        setFeedback("Please write some code before checking the solution.");
        return;
      }

      setLoading(true);

      try{
        const res = await window.puter.ai.chat(
          `You are a helpful interview coach:
          The question is: ${question?.problem}
          Here is the candidate's solution:\n${code}

          1.If correct, say:"✅Correct !Well done !".
          2.If incorrect, say:"❌Incorrect" and give hints but dont reveal the solution.: 
        `
      );

      const reply = typeof res === "string" ? 
      res  : res.message?.content || "";

      setFeedback(reply);

      if(reply.toLowerCase().includes("correct")) {
        setSolved(true);
      }

    } catch(error) {
      setFeedback("Error checking solution. Please try again.",error.message);
    }
    finally {
        setLoading(false);
      }
    }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-900 via-slate-950 to-emerald-900 flex flex-col items-center justify-center p-6 gap-10">
      <h1 className="text-6xl sm:text-8xl font-bold 
      bg-gradient-to-r from-emerald-400 via-sky-300 to-blue-500 bg-clip-text
      text-transparent">AI Interview Coach</h1>

      <div className=' w-full max-w-7xl flex flex-col items-center justify-center '>

        {
          !question ? (
            <div className='
            w-full max-w-md p-10 bg-gray-900/80 backdrop-blur-md border border-gray-700 rounded-3xl shadow-lg shadow-sky-600 hover:scale-2xl hover:shadow-sky-400 transition-duration-300 text-center
            '>
              <Code className='mx-auto mb-4 text-cyan-400 w-24 h-24' size={48} />
              <h2 className=' text-3xl font-semibold text-white mb-4'>Ready to Practice</h2>
              <p className=' text-slate-300 mb-8 text-lg leading-relaxed'>Solve coding interview questions with AI, get hints, and improve your skills.</p>

              <div className=' mb-8'>

                <p className=' text-sky-400 mb-4'>Select difficulty:</p>

                <div className=' flex justify-center gap-3 flex-wrap sm:flex-nowrap'>

                {
                  ["Beginner","Medium","Intermediate"].map((level) => (
                    <button 
                    key={level}
                    onClick={() => handleDifficulty(level)}
                    className={`px-6 py-3 rounded-full
                      cursor-pointer text-sm font-semibold transition-colors duration-200
                    ${difficulty === level ? "bg-blue-500 text-white shadow-md" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}
                    `}
                    >
                      {level}
                    </button>
                  ))
                }
                </div>

                {
                  warning && (
                    <p className=' text-red-500 font-semibold mb-4'>{warning}</p>
                  )
                }

                </div>

                <button
                onClick={generateQuestion}
                disabled={!aiReady || loading}
                className='w-full px-10 py-4 bg-gradient-to-r from-sky-400  to-emerald-400 text-white font-semibold text-lg rounded-3xl shadow-lg transition duration-300 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer hover:from-sky-500 hover:to-emerald-500 '
                >
                  {
                    loading ? (
                      "Generating..."
                    ) : (
                      "Generate Question"
                    )
                  }

                </button>

                


              </div>

          )  : ( <div className=' space-y-6 w-full '>

            <div className=' grid lg:grid-cols-2 gap-6'>
              <div className=' bg-gradient-tobr from-blue-950/40 to-sky-950/50 backdrop-blur-sm border border-indigo-400/30  rounded-2xl p-8 space-y-4 '>
                <div className=' '>
        
                  <h3 className=' text-lg font-semibold text-emerald-300 mb-1 '>Problem</h3>

                  <p className=' text-gray-200'>
                    {question.problem}
                  </p>
                </div>

                <div className=' '>
        
                  <h3 className=' text-lg font-semibold text-emerald-300 mb-1'>Example</h3>

                  <pre className=' bg-black/30 p-3 rounded text-gray-200 whitespace-pre-wrap'>
                    {question.example}
                  </pre>
                </div>

                <div className=' '>
        
                  <h3 className=' text-lg font-semibold text-emerald-300 mb-1'>Constraints</h3>

                  <pre className=' list-disc list-inside text-gray-200'>
                    {question.constraints.split("\n").map((constraint,idx) => (
                      <li 
                      className=' text-wrap'
                      key={idx}>{constraint}</li>
                    ))}
                  </pre>
                </div>

                {
                  question.note && (
                    <div className=' '>
        
                      <h3 className=' text-lg font-semibold text-emerald-300 mb-1'>Note</h3>

                      <p className='  text-gray-200 '>
                        {question.note}
                      </p>
                    </div>
                  )
                }
                </div>

                <div 
                className=' bg-gray-800/60 border border-gray-700/50 rounded-2xl shadow-2xl overflow-hidden  '
                >

                  <div className=' bg-gray-900/90 px-4 border-b py-3 bordrer-gray-700/50 flex items-center gap-3 flex-col '>

                  <div className=' flex items-center gap-2 '>
                  <Code className=' w-5 h-5 text-emerald-400 '/>

                  <h3 className=' text-lg font-semibold text-white'>Solution (Javascript)</h3>

                  </div>

                  

                    <div className=' w-full '>
                    <CodeMirror
                      value={code}
                      height='630px'
                      
                      onChange={(value) => setCode(value)}
                      extensions={[ javascript({jsx:true})]}
                      theme={dracula}
                    />

                    </div>
                  
                  </div>
                  </div>

                <div className='   flex gap-6 lg:gap-10 justify-center items-center flex-col   '>
                    <div className=' flex flex-wrap gap-justify-center items-center gap-2'>

                      <button
                      onClick={checkSolution}
                      disabled={loading || !aiReady || !code.trim()}
                      className='px-6 py-3 bg-gradient-to-r from-blue-500 to-emerald-500
                      hover:opacity-80   text-white font-semibold rounded-2xl shadow-lg transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer  flex items-center gap-2'
                      >
                        <Play className=' w-5 h-5 '/>
                        {
                          loading ? "Checking..." : "Check Solution"
                        }
                      </button>

                      <button
                      onClick={generateQuestion}
                      disabled={loading || !aiReady  }
                      className='px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500
                      hover:opacity-80   text-white font-semibold rounded-2xl shadow-lg transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer  flex items-center gap-2 '
                      >
                        <RotateCcw className=' w-5 h-5 '/>
                        {
                          loading ? "Generating..." : "New  Question"
                        }
                      </button>

                      <button
                      onClick={() => {
                        setQuestion(null);
                        setCode(`      function solution() {\n
                          // Write your code here\n
                        }
                      `);
                        setFeedback("");
                        setSolved(false);
                        setDifficulty("");
                        setWarning("");
                      } }

                      disabled={loading}
                      className='px-6 py-3 bg-gradient-to-r from-red-500 to-emerald-500
                      hover:opacity-80   text-white font-semibold rounded-2xl shadow-lg transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer  flex items-center gap-2'
                      >
                        <ArrowLeft className=' w-5 h-5 '/>
                        Go back
                      </button>

                    </div>

                    <div className=' flex justify-center gap-3 flex-wrap sm:flex-nowrap'>
                      <p className='text-slate-300 font-semibold'>Difficulty</p>
                    {
                  ["Beginner","Medium","Intermediate"].map((level) => (
                    <button 
                    key={level}
                    onClick={() => handleDifficulty(level)}
                    className={`px-6 py-3 rounded-full
                      cursor-pointer text-sm font-semibold transition-colors duration-200
                    ${difficulty === level ? "bg-blue-500 text-white shadow-md" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}
                    `}
                    >
                      {level}
                    </button>
                  ))
                }


                      </div>

                    


                  


                  </div>

                  {
                    feedback && (

                      <div className={`rounded-3xl p-6
                      shadow-2xl backdrop-blur-sm ${
                        feedback.toLowerCase().includes("✅") ?" bg-green-900/40 border border-green-500/30" 
                        : feedback.toLowerCase().includes("❌") ? "bg-red-900/40 border border-red-500/30" : 
                        "bg-gray-800/60 border border-gray-700/50"
                      }
                      `}>
                        <div className=' flex items-start gap-4 mb-4 '>
                          <CheckCircle className={` w-6 h-6 
                          ${feedback.toLowerCase().includes("✅") ?" text-green-400"
                            : feedback.toLowerCase().includes("❌") ? "text-red-400" : "text-blue-400"
                          
                          }`}/>
                          <div className=' flex-1 text-gray-200 whitespace-pre-wrap leading-relaxed '>
                            {feedback}
                          </div>
                        </div>
                        </div>
                    )
                  }

                  

                  

              </div>
              

          
    </div>
          
            
          )

          
        }
        
      </div>
      </div>

    
  );
}

export default App;
