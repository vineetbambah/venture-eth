"use client"

import { useState, useEffect } from "react"

// Extend the Window interface to include the ethereum property
declare global {
  interface Window {
    ethereum?: any
  }
}
import { ethers } from "ethers"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Zap } from "lucide-react"
import ProjectCard from "@/components/project-card"
import CreateProjectForm from "@/components/create-project-form"
import ConnectWallet from "@/components/connect-wallet"
import { toast } from "sonner"
import CrowdfundingABI from "@/lib/CrowdfundingABI.json"

const CONTRACT_ADDRESS = "0xa02Eeb290F4177dF8b6E357dbdc3b840Aa8e5D60" // Replace with your deployed contract address

export default function Home() {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
  const [signer, setSigner] = useState<ethers.Signer | null>(null)
  const [contract, setContract] = useState<ethers.Contract | null>(null)
  const [account, setAccount] = useState<string>("")
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    document.documentElement.classList.add("dark")

    const init = async () => {
      if (typeof window.ethereum !== "undefined") {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum)
          setProvider(provider)

          const signer = await provider.getSigner()
          setSigner(signer)

          // Get account
          const accounts = await provider.listAccounts()
          if (accounts.length > 0) {
            setAccount(accounts[0].address)
          }

          // Initialize contract
          const contract = new ethers.Contract(CONTRACT_ADDRESS, CrowdfundingABI, signer)
          setContract(contract)

          // Load projects
          await loadProjects(contract)
        } catch (error) {
          console.error("Error initializing Web3:", error)
          toast("Error connecting to blockchain")
        }
      } else {
        toast("Web3 not detected")
      }
      setLoading(false)
    }

    init()
  }, [])

  const loadProjects = async (contractInstance: ethers.Contract) => {
    try {
      const projectCount = await contractInstance.projectCount()
      const projectsArray = []

      for (let i = 1; i <= projectCount; i++) {
        const project = await contractInstance.projects(i)
        projectsArray.push({
          id: i,
          creator: project.creator,
          title: project.title,
          description: project.description,
          goal: ethers.formatEther(project.goal),
          currentAmount: ethers.formatEther(project.currentAmount),
          deadline: new Date(Number(project.deadline) * 1000),
          completed: project.completed,
        })
      }

      setProjects(projectsArray)
    } catch (error) {
      console.error("Error loading projects:", error)
    }
  }

  const connectWalletHandler = async () => {
    try {
      if (window.ethereum) {
        await window.ethereum.request({ method: "eth_requestAccounts" })
        const provider = new ethers.BrowserProvider(window.ethereum)
        setProvider(provider)

        const signer = await provider.getSigner()
        setSigner(signer)

        setAccount(await signer.getAddress())

        const contract = new ethers.Contract(CONTRACT_ADDRESS, CrowdfundingABI, signer)
        setContract(contract)

        await loadProjects(contract)

        toast("Wallet connected",)
      } else {
        toast("MetaMask not found")
      }
    } catch (error) {
      console.error("Error connecting wallet:", error)
      toast("Connection failed")
    }
  }

  const createProject = async (projectData: any) => {
    if (!contract || !signer) return

    try {
      const goalInWei = ethers.parseEther(projectData.goal)
      const deadlineTimestamp = Math.floor(new Date(projectData.deadline).getTime() / 1000)

      const tx = await contract.createProject(projectData.title, projectData.description, goalInWei, deadlineTimestamp)

      toast("Creating project")

      await tx.wait()

      toast("Project created")

      await loadProjects(contract)
    } catch (error) {
      console.error("Error creating project:", error)
      toast("Transaction failed")
    }
  }

  const fundProject = async (projectId: number, amount: string) => {
    if (!contract || !signer) return

    try {
      const amountInWei = ethers.parseEther(amount)

      const tx = await contract.fundProject(projectId, {
        value: amountInWei,
      })

      toast("Processing contribution")

      await tx.wait()

      toast("Contribution successful")

      await loadProjects(contract)
    } catch (error) {
      console.error("Error funding project:", error)
      toast("Transaction failed")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-black">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-white">Loading Venture Eth</h2>
          <div className="animate-spin h-8 w-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto"></div>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white relative overflow-hidden">

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="flex flex-col items-center justify-between mb-12">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-blue-500 to-teal-400">
              Venture Eth
            </h1>
            <div className="flex items-center justify-center gap-2 mb-8">
              <Zap className="h-5 w-5 text-blue-400" />
              <p className="text-xl text-blue-100">Raise funds without intermediaries. Govern projects on-chain. Back ideas with full transparency.</p>
            </div>
          </div>

          {!account ? (
            <ConnectWallet onConnect={connectWalletHandler} />
          ) : (
            <div className="flex items-center gap-2 bg-gray-800/50 backdrop-blur-sm p-3 rounded-lg border border-gray-700/50 shadow-lg">
              <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse"></div>
              <p className="text-sm font-mono">
                Connected: {account.slice(0, 6)}...{account.slice(-4)}
              </p>
            </div>
          )}
        </div>

        {account ? (
          <Tabs defaultValue="browse" className="w-full max-w-4xl mx-auto">
            <TabsList className="grid w-full grid-cols-2 mb-8 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50">
              <TabsTrigger
                value="browse"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/20 data-[state=active]:to-blue-500/20 text-white "
              >
                💰 Invest in Innovation
              </TabsTrigger>
              <TabsTrigger
                value="create"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/20 data-[state=active]:to-blue-500/20 text-white "
              >
                🔗 Launch a Campaign
              </TabsTrigger>
            </TabsList>

            <TabsContent value="browse">
              {projects.length === 0 ? (
                <Alert className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50">
                  <AlertCircle className="h-4 w-4 text-blue-400" />
                  <AlertTitle className="text-white">No projects found</AlertTitle>
                  <AlertDescription className="text-blue-100">
                    There are no crowdfunding projects yet. Be the first to create one!
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {projects.map((project) => (
                    <ProjectCard key={project.id} project={project} onFund={fundProject} userAddress={account} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="create">
              <CreateProjectForm onSubmit={createProject} />
            </TabsContent>
          </Tabs>
        ) : (
          <div className="text-center max-w-md mx-auto">
            <Alert className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50">
              <AlertCircle className="h-4 w-4 text-blue-400" />
              <AlertTitle className="text-white">Wallet not connected</AlertTitle>
              <AlertDescription className="text-blue-100">
                Please connect your Ethereum wallet to browse and create crowdfunding projects.
              </AlertDescription>
            </Alert>
          </div>
        )}
      </div>
    </main>
  )
}